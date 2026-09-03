# Phase 1 Backend Updates (`real_estate_api`)

To complete the backend alignment for Phase 1 (replacing NIN/BVN with document/CAC uploads and exposing the Property Passport metrics), apply the following changes to `/home/victor/Desktop/real_estate_api`:

---

### 1. Update `apps/kyc/models.py`
Replace the contents of `apps/kyc/models.py` with:

```python
"""
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
        help_text='Internal verification reference.',
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
```

---

### 2. Update `apps/kyc/serializers.py`
Replace `apps/kyc/serializers.py` with:

```python
"""
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
            'document_image': {'required': True},
            'document_number': {'required': True},
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
```

---

### 3. Update `apps/kyc/views.py`
Update `apps/kyc/views.py`:

```python
"""
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

        vtype = serializer.validated_data['verification_type']
        doc_number = serializer.validated_data.get('document_number', '').strip()
        doc_image = serializer.validated_data.get('document_image')

        # Update or create verification entry
        verification, created = KYCVerification.objects.update_or_create(
            user=request.user,
            defaults={
                'verification_type': vtype,
                'document_number': doc_number,
                'document_image': doc_image,
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
```

---

### 4. Run Django Migrations in `real_estate_api`:
```bash
python manage.py makemigrations kyc
python manage.py migrate
```
