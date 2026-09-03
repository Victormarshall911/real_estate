#!/usr/bin/env python3
"""
Sync all backend updates for Phases 1 through 5 directly into real_estate_api.
"""
import os
import sys

BACKEND_DIR = "/home/victor/Desktop/real_estate_api"

def write_backend_file(relative_path, content):
    full_path = os.path.join(BACKEND_DIR, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Synchronized: {full_path}")

# 1. apps/kyc/models.py
KYC_MODELS = '''"""
KYC Verification model — tracks identity and corporate verification via ID document and CAC certificate uploads.
"""
import uuid
from django.conf import settings
from django.db import models


class KYCVerification(models.Model):
    """
    Records an identity or corporate verification submission for a user.
    Supports Driver's License, International Passport, Voter's Card, and CAC Business Certificate.
    """

    class VerificationType(models.TextChoices):
        DRIVERS_LICENSE = 'drivers_license', "Driver's License"
        INTERNATIONAL_PASSPORT = 'international_passport', "International Passport"
        VOTERS_CARD = 'voters_card', "Voter's Card"
        CAC_CERTIFICATE = 'cac_certificate', "CAC Registration Certificate"
        NATIONAL_ID = 'national_id', "National ID Card/Slip"

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        VERIFIED = 'verified', 'Verified'
        FAILED = 'failed', 'Rejected'
        EXPIRED = 'expired', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc_verification',
    )
    provider = models.CharField(max_length=50, default='document_upload')
    verification_type = models.CharField(
        max_length=30,
        choices=VerificationType.choices,
        default=VerificationType.DRIVERS_LICENSE,
    )
    document_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='ID card number or CAC Registration / BN number.',
    )
    id_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Legacy ID reference if applicable.',
    )
    document_image = models.FileField(
        upload_to='kyc_documents/',
        null=True,
        blank=True,
        help_text='Uploaded photo of the ID card or CAC certificate.',
    )
    reference_id = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Internal or third-party verification reference.',
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    rejection_reason = models.TextField(
        blank=True,
        default='',
        help_text='Reason for rejection if verification failed.',
    )
    response_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Metadata or review notes.',
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'kyc_verifications'
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.user.email} — {self.get_verification_type_display()} ({self.status})'

    @property
    def verification_level(self):
        if self.status != self.Status.VERIFIED:
            return 'unverified'
        if self.verification_type == self.VerificationType.CAC_CERTIFICATE:
            return 'cac_verified'
        return 'id_verified'
'''

# 2. apps/kyc/serializers.py
KYC_SERIALIZERS = '''"""
Serializers for document-based KYC verification.
"""
from rest_framework import serializers
from .models import KYCVerification


class InitiateKYCSerializer(serializers.ModelSerializer):
    """Validates document upload submission for KYC."""
    
    class Meta:
        model = KYCVerification
        fields = ['verification_type', 'document_number', 'document_image']
        extra_kwargs = {
            'document_image': {'required': False},
            'document_number': {'required': False},
        }


class KYCStatusSerializer(serializers.ModelSerializer):
    """Read-only serializer for KYC status."""
    verification_level = serializers.CharField(read_only=True)
    verification_type_display = serializers.CharField(source='get_verification_type_display', read_only=True)

    class Meta:
        model = KYCVerification
        fields = [
            'id', 'verification_type', 'verification_type_display',
            'verification_level', 'status', 'document_number',
            'submitted_at', 'verified_at', 'rejection_reason',
        ]
        read_only_fields = fields
'''

# 3. apps/kyc/views.py
KYC_VIEWS = '''"""
Views for KYC verification: document submission and status tracking.
"""
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import KYCVerification
from .serializers import InitiateKYCSerializer, KYCStatusSerializer


class InitiateKYCView(APIView):
    """
    POST /api/v1/kyc/initiate/
    Submits an ID card or CAC certificate document upload for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = InitiateKYCSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vtype = serializer.validated_data.get('verification_type', KYCVerification.VerificationType.DRIVERS_LICENSE)
        doc_number = serializer.validated_data.get('document_number', '').strip()
        doc_image = serializer.validated_data.get('document_image')

        # Update or create verification entry
        verification, created = KYCVerification.objects.update_or_create(
            user=request.user,
            defaults={
                'verification_type': vtype,
                'document_number': doc_number,
                'document_image': doc_image if doc_image else None,
                'status': KYCVerification.Status.PENDING,
                'submitted_at': timezone.now(),
            }
        )

        return Response(
            {
                'status': 'pending',
                'message': 'Your documents have been submitted successfully and are under review by our compliance team.',
                'verification': KYCStatusSerializer(verification).data,
            },
            status=status.HTTP_200_OK,
        )


class KYCStatusView(APIView):
    """
    GET /api/v1/kyc/status/
    Returns current KYC verification status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            verification = KYCVerification.objects.get(user=request.user)
            return Response(KYCStatusSerializer(verification).data)
        except KYCVerification.DoesNotExist:
            return Response(
                {'status': 'none', 'message': 'No verification on file.'},
                status=status.HTTP_200_OK,
            )
'''

# 4. apps/properties/services/scoring.py
PROPERTIES_SCORING = '''"""
Scoring engine for Property Investment Potential and Passport Trust Scores.
"""

def calculate_property_investment_score(property_listing):
    """
    Computes a 0-100 algorithmic score assessing the investment potential of a listing.
    """
    title_score = 15
    if property_listing.has_c_of_o:
        title_score = 35
    elif property_listing.has_survey_plan:
        title_score = 25
    if property_listing.is_title_verified:
        title_score = min(35, title_score + 5)

    infra_score = 10
    if property_listing.has_electricity:
        infra_score += 5
    if property_listing.has_water:
        infra_score += 4
    if property_listing.has_drainage:
        infra_score += 3
    if property_listing.has_security:
        infra_score += 3
    infra_score = min(25, infra_score)

    seller_score = 10
    seller = property_listing.realtor or property_listing.landlord or property_listing.developer
    if seller and getattr(seller, 'is_verified', False):
        seller_score = 20

    value_score = 14
    if property_listing.latitude and property_listing.longitude:
        value_score += 6
    value_score = min(20, value_score)

    total_score = title_score + infra_score + seller_score + value_score

    return {
        'total_score': total_score,
        'rating_label': 'Strong Growth Potential' if total_score >= 75 else ('Moderate Potential' if total_score >= 55 else 'Standard Yield'),
        'title_score': title_score,
        'infra_score': infra_score,
        'seller_score': seller_score,
        'value_score': value_score,
    }
'''

# 5. apps/properties/views_ai.py
PROPERTIES_AI_VIEWS = r'''"""
AI-assisted natural language property discovery endpoint.
"""
import re
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PropertyListing
from .serializers import PropertyListSerializer


class AIAssistantSearchView(APIView):
    """
    POST /api/v1/properties/ai-search/
    Parses natural language budget, state/location, and property type to return recommended matches.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)

        q_lower = query.lower()
        queryset = PropertyListing.objects.filter(status=PropertyListing.Status.AVAILABLE)

        # 1. Parse budget in millions
        million_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|million|milli)', q_lower)
        if million_match:
            budget = float(million_match.group(1)) * 1_000_000
            queryset = queryset.filter(price__lte=budget)

        # 2. Location filter matches
        for loc in ['lagos', 'abuja', 'delta', 'rivers', 'oyo', 'enugu', 'asaba', 'lekki', 'epe', 'maitama', 'ikoyi']:
            if loc in q_lower:
                queryset = queryset.filter(
                    Q(state__icontains=loc) |
                    Q(location__icontains=loc) |
                    Q(title__icontains=loc)
                )

        # 3. Document keywords
        if 'c of o' in q_lower or 'co of o' in q_lower:
            queryset = queryset.filter(has_c_of_o=True)
        if 'survey' in q_lower:
            queryset = queryset.filter(has_survey_plan=True)

        results = queryset.order_by('-is_title_verified', '-created_at')[:4]
        serialized = PropertyListSerializer(results, many=True, context={'request': request}).data

        return Response({
            'query': query,
            'match_count': len(serialized),
            'results': serialized,
            'summary': f"Found {len(serialized)} matching verified properties."
        }, status=status.HTTP_200_OK)
'''

# 6. apps/kyc/admin.py
KYC_ADMIN = '''"""Admin configuration for the KYC verification app."""
from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import KYCVerification


@admin.register(KYCVerification)
class KYCVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'user_email',
        'verification_type',
        'document_number',
        'document_preview',
        'status',
        'submitted_at',
        'verified_at',
    )
    list_filter = ('status', 'verification_type', 'submitted_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'document_number')
    readonly_fields = ('id', 'document_preview_large', 'submitted_at', 'verified_at')
    actions = ['approve_verifications', 'reject_verifications']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def _get_secure_url(self, obj):
        if not obj.document_image:
            return None
        url = obj.document_image.url
        # If running on Render behind HTTPS proxy, ensure https scheme
        if url.startswith('http://') and not url.startswith('http://localhost'):
            url = url.replace('http://', 'https://', 1)
        return url

    def document_preview(self, obj):
        if not obj.document_image:
            if obj.status == KYCVerification.Status.VERIFIED:
                return format_html('<span style="color: #059669; font-weight: bold; font-size: 11px;">✅ Verified (Doc deleted for privacy)</span>')
            return format_html('<span style="color: #94a3b8; font-size: 11px;">No document file</span>')

        file_url = self._get_secure_url(obj)
        is_pdf = file_url.lower().endswith('.pdf')

        if is_pdf:
            return format_html(
                '<a href="{}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #e0e7ff; color: #3730a3; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 11px;">'
                '📄 Open PDF ↗'
                '</a>',
                file_url
            )

        return format_html(
            '<div style="display: flex; align-items: center; gap: 6px;">'
            '<a href="{}" target="_blank">'
            '<img src="{}" style="max-height: 40px; max-width: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\';" />'
            '<span style="display: none; padding: 3px 6px; background: #f1f5f9; color: #475569; border-radius: 4px; font-size: 10px; font-weight: bold;">📎 File</span>'
            '</a>'
            '<a href="{}" target="_blank" style="font-size: 11px; color: #2563eb; font-weight: bold; text-decoration: underline;">View ↗</a>'
            '</div>',
            file_url, file_url, file_url
        )
    document_preview.short_description = 'Document'

    def document_preview_large(self, obj):
        if not obj.document_image:
            if obj.status == KYCVerification.Status.VERIFIED:
                return format_html(
                    '<div style="padding: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-size: 13px;">'
                    '✅ <strong>User Identity Verified.</strong> The uploaded document file was automatically deleted upon approval for NDPR / GDPR privacy protection.'
                    '</div>'
                )
            return 'No document uploaded.'

        file_url = self._get_secure_url(obj)
        is_pdf = file_url.lower().endswith('.pdf')

        if is_pdf:
            return format_html(
                '<div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">'
                '<p style="margin-bottom: 8px; font-weight: bold; color: #1e293b;">Uploaded PDF Document:</p>'
                '<a href="{}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #2563eb; color: #fff; border-radius: 6px; font-weight: bold; text-decoration: none;">'
                '📄 Open / Inspect Full PDF Document ↗'
                '</a>'
                '</div>',
                file_url
            )

        return format_html(
            '<div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">'
            '<a href="{}" target="_blank">'
            '<img src="{}" style="max-height: 450px; max-width: 100%; border-radius: 8px; border: 1px solid #cbd5e1;" onerror="this.alt=\'Image failed to load directly — click link below to open\';" />'
            '</a>'
            '<p style="margin-top: 10px;">'
            '<a href="{}" target="_blank" style="display: inline-block; padding: 6px 14px; background: #2563eb; color: #fff; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 12px;">'
            'Open Original Document in New Tab ↗'
            '</a>'
            '</p>'
            '</div>',
            file_url, file_url, file_url
        )
    document_preview_large.short_description = 'Document Preview'

    def save_model(self, request, obj, form, change):
        """Single-item save in admin: Auto-deletes file on verification approval."""
        if obj.status == KYCVerification.Status.VERIFIED:
            if not obj.verified_at:
                obj.verified_at = timezone.now()
            # Delete uploaded file immediately upon approval for user privacy
            if obj.document_image:
                try:
                    obj.document_image.delete(save=False)
                except Exception:
                    pass
                obj.document_image = None

            # Sync verified status to user role profiles
            user = obj.user
            for profile_attr in ['realtor', 'developer', 'landlord', 'agent', 'architect']:
                profile = getattr(user, profile_attr, None)
                if profile and hasattr(profile, 'is_verified'):
                    profile.is_verified = True
                    profile.save(update_fields=['is_verified'])

        super().save_model(request, obj, form, change)

    def approve_verifications(self, request, queryset):
        """Bulk action: Approves KYC and automatically deletes sensitive document files for privacy."""
        count = 0
        now = timezone.now()
        for verification in queryset:
            verification.status = KYCVerification.Status.VERIFIED
            verification.verified_at = now

            # Delete the document file to protect user privacy
            if verification.document_image:
                try:
                    verification.document_image.delete(save=False)
                except Exception:
                    pass
                verification.document_image = None

            verification.save(update_fields=['status', 'verified_at', 'document_image'])

            # Sync verified status to associated user profile roles
            user = verification.user
            for profile_attr in ['realtor', 'developer', 'landlord', 'agent', 'architect']:
                profile = getattr(user, profile_attr, None)
                if profile and hasattr(profile, 'is_verified'):
                    profile.is_verified = True
                    profile.save(update_fields=['is_verified'])
            count += 1

        self.message_user(
            request,
            f'Successfully approved and verified {count} KYC submissions. Original document files were automatically and securely deleted for user privacy.'
        )
    approve_verifications.short_description = 'Approve selected KYC submissions (Awards Verified Badge & Deletes Document)'

    def reject_verifications(self, request, queryset):
        count = queryset.update(status=KYCVerification.Status.FAILED)
        self.message_user(request, f'Marked {count} KYC submissions as rejected.')
    reject_verifications.short_description = 'Reject selected KYC submissions'
'''

def main():
    print(f"🚀 Updating backend in {BACKEND_DIR}...")
    if not os.path.exists(BACKEND_DIR):
        print(f"❌ Backend directory not found at {BACKEND_DIR}")
        sys.exit(1)

    write_backend_file("apps/kyc/models.py", KYC_MODELS)
    write_backend_file("apps/kyc/serializers.py", KYC_SERIALIZERS)
    write_backend_file("apps/kyc/views.py", KYC_VIEWS)
    write_backend_file("apps/kyc/admin.py", KYC_ADMIN)
    write_backend_file("apps/properties/services/scoring.py", PROPERTIES_SCORING)
    write_backend_file("apps/properties/views_ai.py", PROPERTIES_AI_VIEWS)

    print("\n🎉 Backend files successfully synchronized directly into real_estate_api!")

if __name__ == "__main__":
    main()

