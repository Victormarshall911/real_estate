#!/usr/bin/env python3
"""
Sync all backend updates for Phases 1 through 5, Escrow Dual Confirmation & Mediation,
and the Comprehensive Virtual Wallet directly into real_estate_api.
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

# =====================================================================
# 1. apps/escrows/models.py
# =====================================================================
ESCROWS_MODELS = '''import uuid
from django.conf import settings
from django.db import models
from properties.models import PropertyListing


class EscrowTransaction(models.Model):
    """
    Escrow transactions for purchasing properties (buildings or land).
    Supports multi-milestone validation, dual confirmation, and automated dispute mediation.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),        # Proposed by buyer, waiting for seller to accept
        ('escrowed', 'Funds Locked'),           # Accepted by seller, buyer funds are debited & locked in escrow
        ('in_mediation', 'In Mediation'),       # Discrepancy or confirmation conflict, platform team intervened
        ('completed', 'Completed'),             # Both parties confirmed or mediation resolved, funds released to seller
        ('cancelled', 'Cancelled/Refunded'),     # Disputed or rejected, funds returned to buyer
        ('disputed', 'Disputed'),               # Legacy dispute flag
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrow_purchases'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrow_sales'
    )
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='escrows'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    # Milestone verification flags
    is_inspected = models.BooleanField(default=False)
    is_documents_verified = models.BooleanField(default=False)
    buyer_approved = models.BooleanField(default=False)
    seller_approved = models.BooleanField(default=False)

    # Dual-confirmation tracking
    buyer_confirmed = models.BooleanField(default=False)
    buyer_confirmed_at = models.DateTimeField(null=True, blank=True)
    seller_confirmed = models.BooleanField(default=False)
    seller_confirmed_at = models.DateTimeField(null=True, blank=True)

    # Mediation & Team Involvement
    in_mediation = models.BooleanField(default=False, db_index=True)
    mediation_reason = models.TextField(blank=True, default='', help_text="Reason mediation was triggered")
    mediation_opened_at = models.DateTimeField(null=True, blank=True)
    mediation_resolved_at = models.DateTimeField(null=True, blank=True)
    mediation_resolution_notes = models.TextField(blank=True, default='')
    mediation_status = models.CharField(
        max_length=30,
        default='none',
        choices=(
            ('none', 'No Mediation'),
            ('opened', 'Mediation Case Opened'),
            ('under_review', 'Team Reviewing'),
            ('resolved', 'Mediation Resolved'),
        )
    )
    
    # Notes/messages
    terms = models.TextField(blank=True, default='', help_text="Proposed terms, duration, or specifications")
    dispute_reason = models.TextField(blank=True, default='', help_text="Reason for raising a dispute")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'escrow_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Escrow {self.id} - {self.property_listing.title} ({self.status})"


class EscrowMediation(models.Model):
    """
    Formal dispute/mediation case opened when there is confirmation conflict
    between buyer and seller, or when an issue is reported.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    escrow = models.ForeignKey(
        EscrowTransaction,
        on_delete=models.CASCADE,
        related_name='mediations'
    )
    case_number = models.CharField(max_length=50, unique=True, db_index=True)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='initiated_mediations'
    )
    reason = models.TextField()
    evidence_notes = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        default='opened',
        choices=(
            ('opened', 'Opened'),
            ('in_review', 'Under Investigation'),
            ('resolved', 'Resolved'),
            ('dismissed', 'Dismissed'),
        )
    )
    resolution = models.CharField(
        max_length=30,
        blank=True,
        default='',
        choices=(
            ('refund_buyer', 'Refund Buyer In Full'),
            ('release_seller', 'Disburse Funds to Seller'),
            ('split', 'Partial Split / Settlement'),
            ('mutual_agreement', 'Resolved by Mutual Agreement'),
        )
    )
    resolution_notes = models.TextField(blank=True, default='')
    assigned_team = models.CharField(max_length=100, default='LandMarket Trust & Compliance Team')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'escrow_mediations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Mediation Case #{self.case_number} ({self.status})"
'''

# =====================================================================
# 2. apps/escrows/serializers.py
# =====================================================================
ESCROWS_SERIALIZERS = '''from rest_framework import serializers
from .models import EscrowTransaction, EscrowMediation


class EscrowMediationSerializer(serializers.ModelSerializer):
    initiated_by_name = serializers.CharField(source='initiated_by.full_name', read_only=True)
    initiated_by_email = serializers.EmailField(source='initiated_by.email', read_only=True)

    class Meta:
        model = EscrowMediation
        fields = [
            'id', 'case_number', 'initiated_by', 'initiated_by_name',
            'initiated_by_email', 'reason', 'evidence_notes', 'status',
            'resolution', 'resolution_notes', 'assigned_team', 'created_at',
            'resolved_at',
        ]
        read_only_fields = fields


class EscrowTransactionSerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    property_title = serializers.CharField(source='property_listing.title', read_only=True)
    property_primary_image = serializers.SerializerMethodField()
    mediations = EscrowMediationSerializer(many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()
    can_confirm = serializers.SerializerMethodField()
    can_reject = serializers.SerializerMethodField()

    class Meta:
        model = EscrowTransaction
        fields = [
            'id', 'buyer', 'buyer_email', 'buyer_name',
            'seller', 'seller_email', 'seller_name',
            'property_listing', 'property_title', 'property_primary_image',
            'amount', 'status', 'is_inspected', 'is_documents_verified',
            'buyer_approved', 'seller_approved',
            'buyer_confirmed', 'buyer_confirmed_at',
            'seller_confirmed', 'seller_confirmed_at',
            'in_mediation', 'mediation_reason', 'mediation_opened_at',
            'mediation_resolved_at', 'mediation_resolution_notes', 'mediation_status',
            'terms', 'dispute_reason', 'mediations',
            'current_user_role', 'can_confirm', 'can_reject',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'buyer', 'seller', 'status', 'is_inspected',
            'is_documents_verified', 'buyer_approved', 'seller_approved',
            'buyer_confirmed', 'buyer_confirmed_at',
            'seller_confirmed', 'seller_confirmed_at',
            'in_mediation', 'mediation_opened_at', 'mediation_resolved_at',
            'mediation_status', 'dispute_reason', 'created_at', 'updated_at'
        ]

    def get_property_primary_image(self, obj):
        request = self.context.get('request')
        if obj.property_listing.primary_image_url:
            from accounts.utils import get_clean_media_url
            return get_clean_media_url(obj.property_listing.primary_image_url, request)
        return None

    def get_current_user_role(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return None
        if user == obj.buyer:
            return 'buyer'
        if user == obj.seller:
            return 'seller'
        return 'observer'

    def get_can_confirm(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        if obj.status not in ['escrowed', 'in_mediation']:
            return False
        if user == obj.buyer and not obj.buyer_confirmed:
            return True
        if user == obj.seller and not obj.seller_confirmed:
            return True
        return False

    def get_can_reject(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        if obj.status == 'escrowed':
            return user in [obj.buyer, obj.seller]
        return False


class EscrowCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowTransaction
        fields = ['property_listing', 'amount', 'terms']

    def validate(self, attrs):
        property_listing = attrs.get('property_listing')
        
        # Check listing status
        if property_listing.status != 'available':
            raise serializers.ValidationError({"property_listing": "This property is not currently available for purchase."})

        # Resolve seller
        seller_user = None
        if property_listing.realtor:
            seller_user = property_listing.realtor.user
        elif property_listing.landlord:
            seller_user = property_listing.landlord.user
        elif property_listing.developer:
            seller_user = property_listing.developer.user
        elif property_listing.architect:
            seller_user = property_listing.architect.user
            
        if not seller_user:
            raise serializers.ValidationError({"property_listing": "Could not identify the seller profile associated with this listing."})
            
        attrs['seller'] = seller_user
        return attrs
'''

# =====================================================================
# 3. apps/escrows/views.py
# =====================================================================
ESCROWS_VIEWS = '''import uuid
from django.utils import timezone
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from wallets.models import Wallet, WalletTransaction
from .models import EscrowTransaction, EscrowMediation
from .serializers import EscrowTransactionSerializer, EscrowCreateSerializer, EscrowMediationSerializer


class EscrowViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage the escrow transaction lifecycle, dual confirmation,
    and automatic dispute mediation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return EscrowTransaction.objects.select_related('buyer', 'seller', 'property_listing').all()
        return (
            EscrowTransaction.objects
            .select_related('buyer', 'seller', 'property_listing')
            .filter(models.Q(buyer=user) | models.Q(seller=user))
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return EscrowCreateSerializer
        return EscrowTransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        instance = serializer.instance
        response_serializer = EscrowTransactionSerializer(instance, context=self.get_serializer_context())
        headers = self.get_success_headers(serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        seller = serializer.validated_data['seller']
        if seller == self.request.user:
            raise serializers.ValidationError("You cannot propose to buy your own property.")
        serializer.save(buyer=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Seller accepts the pending proposal and locks the buyer's funds."""
        escrow = self.get_object()
        if escrow.seller != request.user:
            return Response(
                {"error": "Only the seller can accept this proposal."},
                status=status.HTTP_403_FORBIDDEN
            )
        if escrow.status != 'pending':
            return Response(
                {"error": "Only pending proposals can be accepted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        buyer_wallet, _ = Wallet.objects.get_or_create(user=escrow.buyer)
        if buyer_wallet.balance < escrow.amount:
            return Response(
                {"error": "Buyer has insufficient wallet balance to cover this purchase."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lock funds by debiting buyer's wallet
        buyer_wallet.balance -= escrow.amount
        buyer_wallet.save()

        WalletTransaction.objects.create(
            wallet=buyer_wallet,
            transaction_type='payment',
            amount=escrow.amount,
            reference=f"escrow_lock_{escrow.id}",
            description=f"Locked in escrow for purchase of {escrow.property_listing.title}"
        )

        escrow.status = 'escrowed'
        escrow.save()
        
        serializer = self.get_serializer(escrow)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pending deal (either party) or voluntarily refund escrowed funds (seller only)."""
        escrow = self.get_object()

        if escrow.status == 'pending':
            if request.user not in [escrow.buyer, escrow.seller]:
                return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)
            
            escrow.status = 'cancelled'
            escrow.save()
            return Response({"message": "Proposal cancelled successfully."})

        elif escrow.status in ['escrowed', 'in_mediation']:
            if escrow.seller != request.user and not request.user.is_staff:
                return Response(
                    {"error": "Only the seller or compliance team can issue a refund after funds are locked in escrow."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Refund the buyer
            buyer_wallet, _ = Wallet.objects.get_or_create(user=escrow.buyer)
            buyer_wallet.balance += escrow.amount
            buyer_wallet.save()

            WalletTransaction.objects.create(
                wallet=buyer_wallet,
                transaction_type='refund',
                amount=escrow.amount,
                reference=f"escrow_refund_{escrow.id}_{int(timezone.now().timestamp())}",
                description=f"Refund from cancelled escrow for {escrow.property_listing.title}"
            )

            escrow.status = 'cancelled'
            escrow.save()
            return Response({"message": "Escrow transaction refunded and cancelled."})

        return Response(
            {"error": "Cannot cancel this transaction in its current status."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def verify_milestone(self, request, pk=None):
        """Toggle verification flags for inspection or documentation."""
        escrow = self.get_object()
        if request.user not in [escrow.buyer, escrow.seller]:
            return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        milestone = request.data.get('milestone')
        value = request.data.get('value', True)

        if milestone == 'inspection':
            escrow.is_inspected = bool(value)
        elif milestone == 'documents':
            escrow.is_documents_verified = bool(value)
        else:
            return Response(
                {"error": "Invalid milestone. Must be 'inspection' or 'documents'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        escrow.save()
        serializer = self.get_serializer(escrow)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Dual confirmation action:
        - Buyer presses confirmed -> buyer_confirmed = True
        - Seller presses confirmed -> seller_confirmed = True
        - If BOTH confirmed -> completed! Funds disbursed to seller wallet, property marked sold.
        - If one confirmed and other already rejected -> stays in mediation.
        """
        escrow = self.get_object()
        if escrow.status not in ['escrowed', 'in_mediation']:
            return Response(
                {"error": "Confirmation is only available for active escrowed transactions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user not in [escrow.buyer, escrow.seller]:
            return Response({"error": "Only the buyer or seller can confirm completion."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        is_buyer = request.user == escrow.buyer
        is_seller = request.user == escrow.seller

        if is_buyer:
            escrow.buyer_confirmed = True
            escrow.buyer_confirmed_at = now
            escrow.buyer_approved = True
        elif is_seller:
            escrow.seller_confirmed = True
            escrow.seller_confirmed_at = now
            escrow.seller_approved = True

        # Check if BOTH have confirmed
        if escrow.buyer_confirmed and escrow.seller_confirmed:
            # Credit the seller's wallet
            seller_wallet, _ = Wallet.objects.get_or_create(user=escrow.seller)
            seller_wallet.balance += escrow.amount
            seller_wallet.save()

            WalletTransaction.objects.create(
                wallet=seller_wallet,
                transaction_type='receipt',
                amount=escrow.amount,
                reference=f"escrow_release_{escrow.id}_{int(now.timestamp())}",
                description=f"Received payment from escrow for {escrow.property_listing.title}"
            )

            # Mark listing as sold
            escrow.property_listing.status = 'sold'
            escrow.property_listing.save(update_fields=['status'])

            escrow.status = 'completed'
            escrow.in_mediation = False
            escrow.mediation_status = 'resolved'
            escrow.mediation_resolved_at = now
            escrow.mediation_resolution_notes = "Resolved automatically upon mutual dual-confirmation by buyer and seller."
            escrow.save()

            serializer = self.get_serializer(escrow)
            return Response({
                "message": "Both parties confirmed! Escrow funds released to seller and deal marked complete.",
                "escrow": serializer.data
            }, status=status.HTTP_200_OK)

        escrow.save()
        serializer = self.get_serializer(escrow)
        waiting_on = "seller" if is_buyer else "buyer"
        return Response({
            "message": f"Confirmation recorded successfully. Waiting for the {waiting_on} to confirm.",
            "escrow": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject_confirmation(self, request, pk=None):
        """
        Triggered when a buyer or seller refuses confirmation or flags an issue.
        Immediately opens a mediation case and assigns the LandMarket team.
        """
        escrow = self.get_object()
        if request.user not in [escrow.buyer, escrow.seller]:
            return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason', '').strip()
        evidence_notes = request.data.get('evidence_notes', '').strip()

        if not reason:
            return Response({"error": "A specific reason is required to reject confirmation or report an issue."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        is_buyer = request.user == escrow.buyer
        party_name = "Buyer" if is_buyer else "Seller"

        # Update escrow state
        escrow.status = 'in_mediation'
        escrow.in_mediation = True
        escrow.mediation_status = 'opened'
        escrow.mediation_reason = f"{party_name} ({request.user.email}) rejected confirmation: {reason}"
        escrow.mediation_opened_at = now

        if is_buyer:
            escrow.buyer_confirmed = False
        else:
            escrow.seller_confirmed = False

        escrow.save()

        # Create mediation record
        case_no = f"MED-{uuid.uuid4().hex[:8].upper()}"
        mediation = EscrowMediation.objects.create(
            escrow=escrow,
            case_number=case_no,
            initiated_by=request.user,
            reason=reason,
            evidence_notes=evidence_notes,
            status='opened',
            assigned_team='LandMarket Trust & Compliance Team'
        )

        serializer = self.get_serializer(escrow)
        return Response({
            "message": f"Mediation opened (Case #{case_no}). The LandMarket Trust & Safety team has been assigned to arbitrate.",
            "case_number": case_no,
            "escrow": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def dispute(self, request, pk=None):
        """Alias for raising a formal dispute / mediation request."""
        return self.reject_confirmation(request, pk)

    @action(detail=True, methods=['post'])
    def resolve_mediation(self, request, pk=None):
        """
        Compliance / Admin endpoint to arbitrate an in-mediation escrow deal.
        Resolution actions:
        - 'refund_buyer': Return full funds to buyer
        - 'release_seller': Disburse funds to seller
        - 'split': Split funds (50/50 or custom)
        """
        if not request.user.is_staff:
            return Response({"error": "Only LandMarket Compliance administrators can arbitrate mediations."}, status=status.HTTP_403_FORBIDDEN)

        escrow = self.get_object()
        resolution_type = request.data.get('resolution')
        notes = request.data.get('notes', 'Resolved by administrative compliance decision.')
        now = timezone.now()

        if resolution_type == 'refund_buyer':
            buyer_wallet, _ = Wallet.objects.get_or_create(user=escrow.buyer)
            buyer_wallet.balance += escrow.amount
            buyer_wallet.save()

            WalletTransaction.objects.create(
                wallet=buyer_wallet,
                transaction_type='refund',
                amount=escrow.amount,
                reference=f"med_refund_{escrow.id}_{int(now.timestamp())}",
                description=f"Mediation resolution refund for {escrow.property_listing.title}"
            )
            escrow.status = 'cancelled'

        elif resolution_type == 'release_seller':
            seller_wallet, _ = Wallet.objects.get_or_create(user=escrow.seller)
            seller_wallet.balance += escrow.amount
            seller_wallet.save()

            WalletTransaction.objects.create(
                wallet=seller_wallet,
                transaction_type='receipt',
                amount=escrow.amount,
                reference=f"med_release_{escrow.id}_{int(now.timestamp())}",
                description=f"Mediation resolution disbursement for {escrow.property_listing.title}"
            )
            escrow.property_listing.status = 'sold'
            escrow.property_listing.save(update_fields=['status'])
            escrow.status = 'completed'

        elif resolution_type == 'split':
            half = escrow.amount / 2
            buyer_wallet, _ = Wallet.objects.get_or_create(user=escrow.buyer)
            buyer_wallet.balance += half
            buyer_wallet.save()

            seller_wallet, _ = Wallet.objects.get_or_create(user=escrow.seller)
            seller_wallet.balance += half
            seller_wallet.save()

            WalletTransaction.objects.create(
                wallet=buyer_wallet,
                transaction_type='refund',
                amount=half,
                reference=f"med_split_b_{escrow.id}_{int(now.timestamp())}",
                description=f"Mediation 50% settlement refund for {escrow.property_listing.title}"
            )
            WalletTransaction.objects.create(
                wallet=seller_wallet,
                transaction_type='receipt',
                amount=half,
                reference=f"med_split_s_{escrow.id}_{int(now.timestamp())}",
                description=f"Mediation 50% settlement payment for {escrow.property_listing.title}"
            )
            escrow.status = 'completed'
        else:
            return Response({"error": "Invalid resolution type. Must be refund_buyer, release_seller, or split."}, status=status.HTTP_400_BAD_REQUEST)

        escrow.in_mediation = False
        escrow.mediation_status = 'resolved'
        escrow.mediation_resolved_at = now
        escrow.mediation_resolution_notes = notes
        escrow.save()

        # Update all active mediation records for this escrow
        escrow.mediations.filter(status__in=['opened', 'in_review']).update(
            status='resolved',
            resolution=resolution_type,
            resolution_notes=notes,
            resolved_at=now
        )

        serializer = self.get_serializer(escrow)
        return Response({
            "message": f"Mediation case resolved with action '{resolution_type}'.",
            "escrow": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        """Legacy direct release or staff release."""
        return self.confirm(request, pk)
'''

# =====================================================================
# 4. apps/escrows/admin.py
# =====================================================================
ESCROWS_ADMIN = '''from django.contrib import admin
from django.utils import timezone
from .models import EscrowTransaction, EscrowMediation
from wallets.models import Wallet, WalletTransaction


class EscrowMediationInline(admin.TabularInline):
    model = EscrowMediation
    extra = 0
    readonly_fields = ('case_number', 'initiated_by', 'reason', 'status', 'created_at')


@admin.register(EscrowTransaction)
class EscrowTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'buyer', 'seller', 'property_listing', 'amount',
        'status', 'buyer_confirmed', 'seller_confirmed',
        'in_mediation', 'mediation_status', 'created_at'
    )
    list_filter = ('status', 'in_mediation', 'buyer_confirmed', 'seller_confirmed', 'created_at')
    search_fields = ('id', 'buyer__email', 'seller__email', 'property_listing__title', 'mediation_reason')
    readonly_fields = ('id', 'created_at', 'updated_at', 'mediation_opened_at', 'mediation_resolved_at')
    inlines = [EscrowMediationInline]
    actions = ['admin_release_to_seller', 'admin_refund_to_buyer']

    def admin_release_to_seller(self, request, queryset):
        count = 0
        now = timezone.now()
        for escrow in queryset.filter(status__in=['escrowed', 'in_mediation']):
            seller_wallet, _ = Wallet.objects.get_or_create(user=escrow.seller)
            seller_wallet.balance += escrow.amount
            seller_wallet.save()

            WalletTransaction.objects.create(
                wallet=seller_wallet,
                transaction_type='receipt',
                amount=escrow.amount,
                reference=f"admin_release_{escrow.id}_{int(now.timestamp())}",
                description=f"Admin released escrow funds for {escrow.property_listing.title}"
            )
            escrow.status = 'completed'
            escrow.in_mediation = False
            escrow.mediation_status = 'resolved'
            escrow.mediation_resolved_at = now
            escrow.save()
            count += 1
        self.message_user(request, f"Successfully released funds to seller for {count} escrow transactions.")
    admin_release_to_seller.short_description = "Arbitrate & Release Funds to Seller"

    def admin_refund_to_buyer(self, request, queryset):
        count = 0
        now = timezone.now()
        for escrow in queryset.filter(status__in=['escrowed', 'in_mediation']):
            buyer_wallet, _ = Wallet.objects.get_or_create(user=escrow.buyer)
            buyer_wallet.balance += escrow.amount
            buyer_wallet.save()

            WalletTransaction.objects.create(
                wallet=buyer_wallet,
                transaction_type='refund',
                amount=escrow.amount,
                reference=f"admin_refund_{escrow.id}_{int(now.timestamp())}",
                description=f"Admin refunded escrow funds for {escrow.property_listing.title}"
            )
            escrow.status = 'cancelled'
            escrow.in_mediation = False
            escrow.mediation_status = 'resolved'
            escrow.mediation_resolved_at = now
            escrow.save()
            count += 1
        self.message_user(request, f"Successfully refunded {count} escrow transactions back to buyers.")
    admin_refund_to_buyer.short_description = "Arbitrate & Refund Funds to Buyer"


@admin.register(EscrowMediation)
class EscrowMediationAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'escrow', 'initiated_by', 'status', 'resolution', 'assigned_team', 'created_at')
    list_filter = ('status', 'resolution', 'created_at')
    search_fields = ('case_number', 'reason', 'evidence_notes', 'initiated_by__email')
    readonly_fields = ('id', 'case_number', 'created_at', 'resolved_at')
'''

# =====================================================================
# 5. apps/wallets/models.py
# =====================================================================
WALLETS_MODELS = '''import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Wallet(models.Model):
    """
    Virtual wallet for users to hold funds (e.g. for connection fees, inspection, or escrow).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"{self.user.email} - Balance: ₦{self.balance:,.2f}"

    @property
    def locked_in_escrow(self):
        """Calculates total funds currently held in active escrow transactions for this buyer."""
        from escrows.models import EscrowTransaction
        escrows = EscrowTransaction.objects.filter(
            buyer=self.user,
            status__in=['escrowed', 'in_mediation']
        )
        total = sum((e.amount for e in escrows), Decimal('0.00'))
        return total


class WalletTransaction(models.Model):
    """
    Records any credit or debit to a wallet, including bank withdrawals and virtual account deposits.
    """
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),           # Adding money to wallet via payment gateway or bank transfer
        ('withdrawal', 'Withdrawal'),     # Cashing out to Nigerian bank account
        ('payment', 'Payment'),           # Paying for a service (e.g. escrow/connection fee)
        ('refund', 'Refund'),             # Refunding an escrow or payment
        ('receipt', 'Receipt'),           # Receiving money from an escrow payout
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, unique=True, help_text="Unique external or internal reference")
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')

    # Bank payout metadata
    bank_name = models.CharField(max_length=100, blank=True, default='')
    account_number = models.CharField(max_length=20, blank=True, default='')
    account_name = models.CharField(max_length=150, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.capitalize()} - ₦{self.amount:,.2f} ({self.wallet.user.email})"
'''

# =====================================================================
# 6. apps/wallets/serializers.py
# =====================================================================
WALLETS_SERIALIZERS = '''import hashlib
from rest_framework import serializers
from .models import Wallet, WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'transaction_type', 'amount', 'reference',
            'description', 'status', 'bank_name', 'account_number',
            'account_name', 'created_at'
        ]
        read_only_fields = fields


class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)
    locked_in_escrow = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    virtual_account = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'locked_in_escrow', 'virtual_account', 'created_at', 'updated_at', 'transactions']
        read_only_fields = fields

    def get_virtual_account(self, obj):
        """Generates deterministic virtual account details for bank transfer deposits."""
        user = obj.user
        # Generate clean 10-digit account number from user uuid/email
        raw_num = int(hashlib.md5(f"wm_{user.id}".encode('utf-8')).hexdigest()[:8], 16)
        acct_num = f"9{str(raw_num).zfill(9)[:9]}"
        
        full_name = user.full_name or f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0]
        return {
            'bank_name': 'Wema Bank (Virtual Transfer)',
            'secondary_bank': 'Providus Bank',
            'account_number': acct_num,
            'account_name': f"LandMarket / {full_name}",
            'currency': 'NGN',
            'instruction': 'Make a direct bank transfer to this dedicated account to instantly fund your LandMarket wallet.'
        }


class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=100)
    reference = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)


class WithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=500)
    bank_name = serializers.CharField(max_length=100)
    account_number = serializers.CharField(max_length=20, min_length=10)
    account_name = serializers.CharField(max_length=150)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_account_number(self, value):
        v = value.strip()
        if not v.isdigit() or len(v) != 10:
            raise serializers.ValidationError("Nigerian NUBAN bank account number must be exactly 10 digits.")
        return v
'''

# =====================================================================
# 7. apps/wallets/views.py
# =====================================================================
WALLETS_VIEWS = '''import uuid
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Wallet, WalletTransaction
from .serializers import (
    WalletSerializer,
    WalletTransactionSerializer,
    DepositSerializer,
    WithdrawalSerializer
)

NIGERIAN_BANKS = [
    {"code": "058", "name": "Guaranty Trust Bank (GTBank)"},
    {"code": "057", "name": "Zenith Bank"},
    {"code": "044", "name": "Access Bank"},
    {"code": "011", "name": "First Bank of Nigeria"},
    {"code": "033", "name": "United Bank for Africa (UBA)"},
    {"code": "035", "name": "Wema Bank / ALAT"},
    {"code": "101", "name": "Providus Bank"},
    {"code": "070", "name": "Fidelity Bank"},
    {"code": "214", "name": "First City Monument Bank (FCMB)"},
    {"code": "221", "name": "Stanbic IBTC Bank"},
    {"code": "232", "name": "Sterling Bank"},
    {"code": "032", "name": "Union Bank of Nigeria"},
    {"code": "082", "name": "Keystone Bank"},
    {"code": "50515", "name": "Moniepoint Microfinance Bank"},
    {"code": "999991", "name": "OPay Digital Services"},
    {"code": "999992", "name": "Palmpay"},
    {"code": "50211", "name": "Kuda Microfinance Bank"},
    {"code": "51204", "name": "FairMoney Microfinance Bank"},
]


class WalletViewSet(viewsets.GenericViewSet):
    """
    API endpoint for managing virtual wallets, bank deposits, and withdrawals.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's wallet (create if doesn't exist)."""
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], serializer_class=DepositSerializer)
    def deposit(self, request):
        """
        Deposit funds via card top-up or mock bank transfer gateway.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        reference = serializer.validated_data['reference']
        description = serializer.validated_data.get('description', 'Wallet Deposit')

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        if WalletTransaction.objects.filter(reference=reference).exists():
            return Response({'error': 'Duplicate transaction reference.'}, status=status.HTTP_400_BAD_REQUEST)

        wallet.balance += amount
        wallet.save()

        tx = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='deposit',
            amount=amount,
            reference=reference,
            description=description,
            status='completed'
        )

        return Response({
            'message': f'₦{amount:,.2f} deposited successfully!',
            'balance': str(wallet.balance),
            'transaction': WalletTransactionSerializer(tx).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], serializer_class=WithdrawalSerializer)
    def withdraw(self, request):
        """
        Submit a withdrawal payout request to a Nigerian bank account.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']
        bank_name = serializer.validated_data['bank_name']
        account_number = serializer.validated_data['account_number']
        account_name = serializer.validated_data['account_name']
        description = serializer.validated_data.get(
            'description',
            f"Withdrawal to {bank_name} - {account_number}"
        )

        wallet, _ = Wallet.objects.get_or_create(user=request.user)

        if wallet.balance < amount:
            return Response(
                {"error": f"Insufficient balance. Your available balance is ₦{wallet.balance:,.2f}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Debit wallet balance
        wallet.balance -= amount
        wallet.save()

        ref = f"wdr_{uuid.uuid4().hex[:12]}"
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='withdrawal',
            amount=amount,
            reference=ref,
            description=description,
            status='completed',
            bank_name=bank_name,
            account_number=account_number,
            account_name=account_name
        )

        return Response({
            'message': f"Withdrawal of ₦{amount:,.2f} to {bank_name} ({account_number}) processed successfully.",
            'balance': str(wallet.balance),
            'transaction': WalletTransactionSerializer(tx).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        """
        Returns full paginated transaction history with optional type filter.
        """
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        qs = wallet.transactions.all()

        tx_type = request.query_params.get('type')
        if tx_type:
            qs = qs.filter(transaction_type=tx_type)

        serializer = WalletTransactionSerializer(qs[:50], many=True)
        return Response({
            'count': qs.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def virtual_account(self, request):
        """Returns dedicated virtual account details for the authenticated user."""
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data.get('virtual_account'))

    @action(detail=False, methods=['get'])
    def banks(self, request):
        """Returns list of supported Nigerian banks."""
        return Response(NIGERIAN_BANKS)
'''

# =====================================================================
# 8. apps/wallets/admin.py
# =====================================================================
WALLETS_ADMIN = '''from django.contrib import admin
from .models import Wallet, WalletTransaction


class WalletTransactionInline(admin.TabularInline):
    model = WalletTransaction
    extra = 0
    readonly_fields = ('transaction_type', 'amount', 'reference', 'status', 'bank_name', 'account_number', 'created_at')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [WalletTransactionInline]

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('reference', 'wallet_user', 'transaction_type', 'amount', 'status', 'bank_name', 'created_at')
    list_filter = ('transaction_type', 'status', 'created_at')
    search_fields = ('reference', 'wallet__user__email', 'description', 'account_number', 'account_name')
    readonly_fields = ('id', 'created_at')

    def wallet_user(self, obj):
        return obj.wallet.user.email
    wallet_user.short_description = 'User Email'
'''

# =====================================================================
# 9. apps/accounts/serializers.py (exposing verification levels)
# =====================================================================
ACCOUNTS_SERIALIZERS = '''"""
Serializers for user registration, authentication, profile display, and profile completion.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .utils import get_clean_media_url

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for user data with verified tier badges."""
    full_name = serializers.CharField(read_only=True)
    has_realtor_profile = serializers.SerializerMethodField()
    has_agent_profile = serializers.SerializerMethodField()
    has_landlord_profile = serializers.SerializerMethodField()
    has_developer_profile = serializers.SerializerMethodField()
    is_fully_verified = serializers.BooleanField(read_only=True)
    profile_photo = serializers.SerializerMethodField()
    verification_level = serializers.SerializerMethodField()
    badge_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_email_verified', 'date_joined',
            'has_realtor_profile', 'has_agent_profile', 'has_landlord_profile', 'has_developer_profile',
            'is_kyc_verified', 'is_profile_complete',
            'is_fully_verified', 'verification_level', 'badge_label',
            'date_of_birth', 'full_address', 'profile_photo',
        ]
        read_only_fields = fields

    def get_has_realtor_profile(self, obj):
        return hasattr(obj, 'realtor_profile')

    def get_has_agent_profile(self, obj):
        return hasattr(obj, 'agent_profile')

    def get_has_landlord_profile(self, obj):
        return hasattr(obj, 'landlord_profile')

    def get_has_developer_profile(self, obj):
        return hasattr(obj, 'developer_profile')

    def get_profile_photo(self, obj):
        return get_clean_media_url(obj.profile_photo, self.context.get('request'))

    def get_verification_level(self, obj):
        if hasattr(obj, 'kyc_verification'):
            kyc = obj.kyc_verification
            if kyc.status == 'verified':
                return 'cac_verified' if kyc.verification_type == 'cac_certificate' else 'id_verified'
        if obj.is_email_verified and getattr(obj, 'phone_number', None):
            return 'contact_verified'
        if obj.is_kyc_verified:
            return 'id_verified'
        return 'unverified'

    def get_badge_label(self, obj):
        level = self.get_verification_level(obj)
        mapping = {
            'cac_verified': 'CAC Registered Agency',
            'id_verified': 'Government ID Verified',
            'contact_verified': 'Contact Verified',
            'unverified': 'Unverified',
        }
        return mapping.get(level, 'Unverified')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user personal account information."""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'date_of_birth', 'full_address', 'profile_photo']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['profile_photo'] = get_clean_media_url(instance.profile_photo, self.context.get('request'))
        return ret


class CompleteProfileSerializer(serializers.ModelSerializer):
    """Serializer for the profile completion step (address, DOB, photo)."""

    class Meta:
        model = User
        fields = ['date_of_birth', 'full_address', 'profile_photo', 'is_profile_complete']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['profile_photo'] = get_clean_media_url(instance.profile_photo, self.context.get('request'))
        return ret

    def validate(self, attrs):
        """Ensure at minimum DOB and address are provided for standard buyers/realtors."""
        if self.instance.role in ['architect', 'agent', 'landlord', 'developer'] or attrs.get('is_profile_complete') is True:
            return attrs

        if not attrs.get('date_of_birth') and not self.instance.date_of_birth:
            raise serializers.ValidationError(
                {'date_of_birth': 'Date of birth is required to complete your profile.'}
            )
        if not attrs.get('full_address') and not self.instance.full_address:
            raise serializers.ValidationError(
                {'full_address': 'Address is required to complete your profile.'}
            )
        return attrs

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        dob = validated_data.get('date_of_birth', instance.date_of_birth)
        addr = validated_data.get('full_address', instance.full_address)
        if (dob and addr) or validated_data.get('is_profile_complete'):
            instance.is_profile_complete = True

        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Handles user registration with password validation."""
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )
    tokens = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'password', 'password_confirm', 'tokens',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        """Ensure passwords match."""
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        return attrs

    def get_tokens(self, user):
        """Generate JWT token pair for newly registered user."""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def create(self, validated_data):
        """Create user and hash password."""
        return User.objects.create_user(**validated_data)


class EmailVerifySerializer(serializers.Serializer):
    """Serializer for email verification token."""
    token = serializers.UUIDField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid email or password.')

        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user, context=self.context).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
'''

# =====================================================================
# 10. apps/properties/models.py (add PropertyReport and is_under_review)
# =====================================================================
PROPERTIES_MODELS = '''"""
Property Listing, Property Image, Property View, Documents, and Fraud Reporting models.
Includes full-text search indexing via PostgreSQL.
"""
import uuid

from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models
from django.conf import settings

from realtors.models import RealtorProfile


class State(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)

    class Meta:
        db_table = 'property_states'
        verbose_name = 'State'
        verbose_name_plural = 'States'
        ordering = ['name']

    def __str__(self):
        return self.name


class LGA(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='lgas')

    class Meta:
        db_table = 'property_lgas'
        verbose_name = 'LGA'
        verbose_name_plural = 'LGAs'
        ordering = ['name']
        unique_together = ('name', 'state')

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class PropertyListing(models.Model):
    """
    A land/building property listing. Supports full-text search via PostgreSQL SearchVector.
    """

    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        SOLD = 'sold', 'Sold'
        UNDER_REVIEW = 'under_review', 'Under Investigation / Flagged'

    class PropertyCategory(models.TextChoices):
        LAND = 'land', 'Land'
        BUILDING = 'building', 'Building'

    class PropertyType(models.TextChoices):
        PLOT = 'plot', 'Plot'
        ESTATE = 'estate', 'Upcoming Estate'
        HOUSE = 'house', 'House'
        APARTMENT = 'apartment', 'Apartment'
        COMMERCIAL = 'commercial', 'Commercial Space'
        OFFICE = 'office', 'Office Space'
        SHORT_LET = 'short_let_apartment', 'Short-Let Apartment'

    class ListingType(models.TextChoices):
        SALE = 'sale', 'For Sale'
        RENT = 'rent', 'For Rent'
        LEASE = 'lease', 'For Lease'
        SHORT_LET = 'short_let', 'Short-Let'
        REGULAR = 'regular', 'Regular'
        UPCOMING = 'upcoming', 'Upcoming Estate'

    class RentFrequency(models.TextChoices):
        YEARLY = 'yearly', 'Yearly'
        MONTHLY = 'monthly', 'Monthly'
        DAILY = 'daily', 'Daily'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    realtor = models.ForeignKey(
        RealtorProfile,
        on_delete=models.CASCADE,
        related_name='properties',
        null=True,
        blank=True,
    )
    landlord = models.ForeignKey(
        'landlords.LandlordProfile',
        on_delete=models.CASCADE,
        related_name='properties',
        null=True,
        blank=True,
    )
    developer = models.ForeignKey(
        'developers.DeveloperProfile',
        on_delete=models.CASCADE,
        related_name='properties',
        null=True,
        blank=True,
    )
    architect = models.ForeignKey(
        'architects.ArchitectProfile',
        on_delete=models.CASCADE,
        related_name='properties',
        null=True,
        blank=True,
    )

    title = models.CharField(max_length=300, db_index=True)
    description = models.TextField(
        help_text='Supports markdown formatting for rich property descriptions.'
    )
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text='Price in Nigerian Naira (₦).',
    )
    land_size = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Size in square meters.',
    )
    property_category = models.CharField(
        max_length=20,
        choices=PropertyCategory.choices,
        default=PropertyCategory.LAND,
        db_index=True,
    )
    property_type = models.CharField(
        max_length=30,
        choices=PropertyType.choices,
        default=PropertyType.PLOT,
        db_index=True,
    )
    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)
    built_up_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Built-up area in square meters (for houses/apartments).'
    )
    # Amenity Flags
    has_electricity = models.BooleanField(default=False)
    has_water = models.BooleanField(default=False)
    has_drainage = models.BooleanField(default=False)
    has_security = models.BooleanField(default=False)
    has_generator = models.BooleanField(default=False)
    has_c_of_o = models.BooleanField(default=False)
    has_survey_plan = models.BooleanField(default=False)

    # Rental details
    rent_frequency = models.CharField(
        max_length=15,
        choices=RentFrequency.choices,
        null=True,
        blank=True,
        db_index=True,
    )
    caution_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    agency_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    legal_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # Structured Locations
    state_ref = models.ForeignKey(
        State,
        on_delete=models.SET_NULL,
        related_name='properties',
        null=True,
        blank=True,
    )
    lga_ref = models.ForeignKey(
        LGA,
        on_delete=models.SET_NULL,
        related_name='properties',
        null=True,
        blank=True,
    )

    location = models.CharField(
        max_length=300,
        help_text='Human-readable location string (e.g., "Lekki Phase 1, Lagos").',
        db_index=True,
    )
    state = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='State (e.g., "Lagos", "Abuja").',
        db_index=True,
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='GPS latitude for map placement.',
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='GPS longitude for map placement.',
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    is_title_verified = models.BooleanField(
        default=False,
        help_text='Indicates if the property title has been verified by the LandMarket legal team.'
    )
    listing_type = models.CharField(
        max_length=15,
        choices=ListingType.choices,
        default=ListingType.SALE,
        db_index=True,
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='If true, property appears in the featured carousel.',
        db_index=True,
    )
    is_under_review = models.BooleanField(
        default=False,
        help_text='Flagged automatically if multiple community fraud reports are filed.',
        db_index=True,
    )
    video = models.FileField(
        upload_to='properties/videos/',
        null=True,
        blank=True,
        help_text='Optional promotional video for the property.'
    )
    view_count = models.PositiveIntegerField(default=0, editable=False)
    search_vector = SearchVectorField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_listings'
        verbose_name = 'Property Listing'
        verbose_name_plural = 'Property Listings'
        ordering = ['-created_at']
        indexes = [
            GinIndex(fields=['search_vector'], name='property_search_idx'),
            models.Index(fields=['price'], name='property_price_idx'),
            models.Index(fields=['land_size'], name='property_size_idx'),
            models.Index(fields=['-created_at', 'status'], name='property_date_status_idx'),
        ]

    def __str__(self):
        return f'{self.title} — ₦{self.price:,.2f}'

    @property
    def land_size_plots(self):
        if self.land_size:
            return round(float(self.land_size) / 648, 2)
        return 0

    @property
    def primary_image_url(self):
        primary = self.images.filter(is_primary=True).first()
        if primary:
            return primary.image.url if primary.image else None
        first = self.images.first()
        return first.image.url if first and first.image else None


class PropertyImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='properties/images/')
    caption = models.CharField(max_length=200, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'property_images'
        verbose_name = 'Property Image'
        verbose_name_plural = 'Property Images'
        ordering = ['-is_primary', 'uploaded_at']


class PropertyView(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='views',
    )
    viewer_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'property_views'
        ordering = ['-viewed_at']


class PropertyDocument(models.Model):
    class DocumentType(models.TextChoices):
        C_OF_O = 'c_of_o', 'Certificate of Occupancy'
        DEED = 'deed_of_assignment', 'Deed of Assignment'
        SURVEY = 'survey_plan', 'Registered Survey Plan'
        GAZETTE = 'gazette', 'Excision Gazette'
        OTHER = 'other', 'Other Document'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='documents',
    )
    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.OTHER,
    )
    file = models.FileField(upload_to='property_documents/')
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'property_documents'
        ordering = ['uploaded_at']


class VerificationRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Search'
        IN_PROGRESS = 'in_progress', 'Search In Progress'
        APPROVED = 'approved', 'Approved / Title Clear'
        REJECTED = 'rejected', 'Rejected / Title Disputed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verification_requests',
    )
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='verification_requests',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    report_notes = models.TextField(blank=True, default='')
    fee_charged = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_verification_requests'
        ordering = ['-created_at']


class PropertyAnalyticsEvent(models.Model):
    class EventType(models.TextChoices):
        VIEW = 'view', 'Page View'
        WHATSAPP_CLICK = 'whatsapp_click', 'WhatsApp Click'
        PHONE_CLICK = 'phone_click', 'Phone Call Click'
        ESCROW_PROPOSE = 'escrow_propose', 'Escrow Inquiry'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='analytics_events',
    )
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.VIEW,
        db_index=True,
    )
    viewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='viewed_events',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'property_analytics_events'
        ordering = ['-created_at']


class SavedSearch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_searches',
    )
    title = models.CharField(max_length=255)
    state = models.ForeignKey(
        State,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='saved_searches',
    )
    lga = models.ForeignKey(
        LGA,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='saved_searches',
    )
    property_type = models.CharField(max_length=50, blank=True, null=True)
    max_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    min_bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    email_alerts_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_searches'
        ordering = ['-created_at']


class PropertyReport(models.Model):
    """
    Stores community fraud, dispute, and fake listing reports with auto-moderation support.
    """
    class Reason(models.TextChoices):
        SUSPICIOUS_PAYMENT = 'suspicious_payment', 'Demanded Direct / Offline Payment'
        FAKE_AGENT = 'fake_agent', 'Fake Agent / Impersonation'
        DUPLICATE_LISTING = 'duplicate_listing', 'Duplicate / Stolen Photos'
        DISPUTED_LAND = 'disputed_land', 'Disputed Land / Omo Onile Conflict'
        ALREADY_SOLD = 'already_sold', 'Already Sold / Unavailable'
        PRICE_BAIT = 'price_bait', 'Price Baiting / Misleading Price'
        OTHER = 'other', 'Other Fraud / Safety Concern'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Audit'
        UNDER_REVIEW = 'under_review', 'Under Investigation'
        RESOLVED = 'resolved', 'Resolved / Action Taken'
        DISMISSED = 'dismissed', 'Dismissed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='reports',
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='property_reports',
    )
    contact_email = models.EmailField(blank=True, default='')
    reason = models.CharField(
        max_length=30,
        choices=Reason.choices,
        default=Reason.OTHER,
    )
    description = models.TextField(help_text='Evidence details submitted by reporter.')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'property_reports'
        verbose_name = 'Property Fraud Report'
        verbose_name_plural = 'Property Fraud Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f'Report on {self.property_listing.title} ({self.get_reason_display()})'
'''

# =====================================================================
# 11. apps/properties/serializers.py (add PropertyReportSerializer & investment_metrics)
# =====================================================================
PROPERTIES_SERIALIZERS = '''"""
Serializers for property listings, images, documents, and community fraud reports.
"""
from rest_framework import serializers
from .models import (
    PropertyListing,
    PropertyImage,
    PropertyDocument,
    PropertyReport,
    SavedSearch,
    State,
    LGA,
)
from .services.scoring import calculate_property_investment_score
from realtors.serializers import RealtorProfileSerializer
from landlords.serializers import LandlordProfileSerializer
from developers.serializers import DeveloperProfileSerializer
from architects.serializers import ArchitectProfileSerializer
from accounts.utils import get_clean_media_url


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name']


class LGASerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)

    class Meta:
        model = LGA
        fields = ['id', 'name', 'state', 'state_name']


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'caption', 'is_primary', 'uploaded_at']

    def get_image_url(self, obj):
        return get_clean_media_url(obj.image, self.context.get('request'))


class PropertyDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = PropertyDocument
        fields = ['id', 'document_type', 'document_type_display', 'file_url', 'is_verified', 'uploaded_at']

    def get_file_url(self, obj):
        return get_clean_media_url(obj.file, self.context.get('request'))


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image_url = serializers.SerializerMethodField()
    land_size_plots = serializers.FloatField(read_only=True)
    state_name = serializers.SerializerMethodField()
    lga_name = serializers.SerializerMethodField()
    realtor_name = serializers.SerializerMethodField()
    realtor_company = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    seller_role = serializers.SerializerMethodField()
    seller_verified = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = PropertyListing
        fields = [
            'id', 'title', 'price', 'land_size', 'land_size_plots',
            'location', 'state', 'status', 'listing_type', 'is_featured', 'is_under_review',
            'primary_image_url', 'view_count', 'created_at',
            'property_category', 'property_type', 'bedrooms', 'bathrooms',
            'has_c_of_o', 'has_survey_plan', 'rent_frequency',
            'is_title_verified', 'state_name', 'lga_name',
            'realtor_name', 'realtor_company', 'seller_name', 'seller_role',
            'seller_verified', 'document_count'
        ]

    def get_primary_image_url(self, obj):
        return get_clean_media_url(obj.primary_image_url, self.context.get('request'))

    def get_state_name(self, obj):
        return obj.state_ref.name if obj.state_ref else obj.state

    def get_lga_name(self, obj):
        return obj.lga_ref.name if obj.lga_ref else obj.location

    def get_realtor_name(self, obj):
        return obj.realtor.user.full_name if obj.realtor else None

    def get_realtor_company(self, obj):
        return obj.realtor.company_name if obj.realtor else None

    def get_seller_name(self, obj):
        if obj.realtor:
            return obj.realtor.user.full_name
        if obj.landlord:
            return obj.landlord.user.full_name
        if obj.developer:
            return obj.developer.company_name or obj.developer.user.full_name
        if obj.architect:
            return obj.architect.user.full_name
        return None

    def get_seller_role(self, obj):
        if obj.realtor:
            return 'realtor'
        if obj.developer:
            return 'developer'
        if obj.landlord:
            return 'landlord'
        if obj.architect:
            return 'architect'
        return 'seller'

    def get_seller_verified(self, obj):
        seller = obj.realtor or obj.developer or obj.landlord or obj.architect
        return getattr(seller, 'is_verified', False) if seller else False

    def get_document_count(self, obj):
        return obj.documents.filter(is_verified=True).count()


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    realtor = RealtorProfileSerializer(read_only=True)
    landlord = LandlordProfileSerializer(read_only=True)
    developer = DeveloperProfileSerializer(read_only=True)
    architect = ArchitectProfileSerializer(read_only=True)
    land_size_plots = serializers.FloatField(read_only=True)
    primary_image_url = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()
    lga_name = serializers.SerializerMethodField()
    state_ref = StateSerializer(read_only=True)
    lga_ref = LGASerializer(read_only=True)
    documents = serializers.SerializerMethodField()
    investment_metrics = serializers.SerializerMethodField()

    def get_documents(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        is_owner = False
        if user and user.is_authenticated:
            if obj.realtor and obj.realtor.user == user:
                is_owner = True
            elif obj.landlord and obj.landlord.user == user:
                is_owner = True
            elif obj.developer and obj.developer.user == user:
                is_owner = True
            elif obj.architect and obj.architect.user == user:
                is_owner = True
            elif user.is_staff:
                is_owner = True
        
        docs = obj.documents.all()
        if not is_owner:
            docs = docs.filter(is_verified=True)
            
        return PropertyDocumentSerializer(docs, many=True, context=self.context).data

    def get_investment_metrics(self, obj):
        return calculate_property_investment_score(obj)

    class Meta:
        model = PropertyListing
        fields = [
            'id', 'title', 'description', 'price', 'land_size',
            'land_size_plots', 'location', 'state', 'latitude', 'longitude',
            'status', 'listing_type', 'is_featured', 'is_under_review', 'video', 'primary_image_url',
            'images', 'realtor', 'landlord', 'developer', 'architect',
            'view_count', 'created_at', 'updated_at',
            'property_category', 'property_type', 'bedrooms', 'bathrooms', 'built_up_area',
            'has_electricity', 'has_water', 'has_drainage', 'has_security', 'has_generator',
            'has_c_of_o', 'has_survey_plan', 'rent_frequency', 'caution_fee', 'agency_fee', 'legal_fee',
            'state_ref', 'lga_ref', 'state_name', 'lga_name', 'is_title_verified', 'documents',
            'investment_metrics',
        ]
        read_only_fields = ['id', 'view_count', 'created_at', 'updated_at']

    def get_primary_image_url(self, obj):
        return get_clean_media_url(obj.primary_image_url, self.context.get('request'))

    def get_state_name(self, obj):
        return obj.state_ref.name if obj.state_ref else obj.state

    def get_lga_name(self, obj):
        return obj.lga_ref.name if obj.lga_ref else obj.location


class PropertyCreateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = PropertyListing
        fields = [
            'title', 'description', 'price', 'land_size',
            'location', 'state', 'latitude', 'longitude',
            'listing_type', 'uploaded_images', 'video',
            'property_category', 'property_type', 'bedrooms', 'bathrooms', 'built_up_area',
            'has_electricity', 'has_water', 'has_drainage', 'has_security', 'has_generator',
            'has_c_of_o', 'has_survey_plan', 'rent_frequency', 'caution_fee', 'agency_fee', 'legal_fee',
            'state_ref', 'lga_ref'
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        property_listing = PropertyListing.objects.create(**validated_data)

        for i, image_file in enumerate(uploaded_images):
            PropertyImage.objects.create(
                property_listing=property_listing,
                image=image_file,
                is_primary=(i == 0),
            )

        return property_listing


class PropertyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyReport
        fields = ['id', 'reason', 'description', 'contact_email', 'created_at']
        read_only_fields = ['id', 'created_at']


class SavedSearchSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)
    lga_name = serializers.CharField(source='lga.name', read_only=True)

    class Meta:
        model = SavedSearch
        fields = [
            'id', 'title', 'state', 'state_name', 'lga', 'lga_name',
            'property_type', 'max_price', 'min_bedrooms', 'email_alerts_enabled', 'created_at'
        ]
'''

# =====================================================================
# 12. apps/properties/filters.py (supporting verified_only)
# =====================================================================
PROPERTIES_FILTERS = '''from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db import models
from django_filters import rest_framework as filters
from .models import PropertyListing


class PropertyFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_size = filters.NumberFilter(field_name='land_size', lookup_expr='gte')
    max_size = filters.NumberFilter(field_name='land_size', lookup_expr='lte')
    location = filters.CharFilter(method='filter_location')
    search = filters.CharFilter(method='filter_search')
    status = filters.ChoiceFilter(choices=PropertyListing.Status.choices)
    state = filters.CharFilter(field_name='state', lookup_expr='icontains')
    property_category = filters.CharFilter(field_name='property_category')
    property_type = filters.CharFilter(field_name='property_type')
    bedrooms = filters.NumberFilter(field_name='bedrooms')
    bedrooms_gte = filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    bathrooms = filters.NumberFilter(field_name='bathrooms')
    rent_frequency = filters.CharFilter(field_name='rent_frequency')
    state_ref = filters.NumberFilter(field_name='state_ref')
    lga_ref = filters.NumberFilter(field_name='lga_ref')
    verified_only = filters.BooleanFilter(method='filter_verified_only')

    class Meta:
        model = PropertyListing
        fields = [
            'min_price', 'max_price', 'min_size', 'max_size', 'location', 'search',
            'status', 'state', 'property_category', 'property_type', 'bedrooms',
            'bedrooms_gte', 'bathrooms', 'rent_frequency', 'state_ref', 'lga_ref',
            'verified_only'
        ]

    def filter_location(self, queryset, name, value):
        return queryset.filter(
            models.Q(location__icontains=value) | models.Q(state__icontains=value)
        )

    def filter_verified_only(self, queryset, name, value):
        if value:
            return queryset.filter(
                models.Q(is_title_verified=True) |
                models.Q(documents__is_verified=True) |
                models.Q(realtor__is_verified=True) |
                models.Q(landlord__is_verified=True) |
                models.Q(developer__is_verified=True)
            ).distinct()
        return queryset

    def filter_search(self, queryset, name, value):
        try:
            search_vector = SearchVector('title', weight='A') + SearchVector('description', weight='B')
            search_query = SearchQuery(value)
            return (
                queryset
                .annotate(rank=SearchRank(search_vector, search_query))
                .filter(rank__gte=0.1)
                .order_by('-rank')
            )
        except Exception:
            return queryset.filter(
                models.Q(title__icontains=value) | models.Q(description__icontains=value)
            )
'''

# =====================================================================
# 13. apps/properties/views.py (add report endpoint)
# =====================================================================
PROPERTIES_VIEWS = '''import logging
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from accounts.permissions import IsOwnerOrReadOnly, CanListProperties
from .filters import PropertyFilter
from .models import (
    PropertyListing,
    PropertyImage,
    PropertyDocument,
    PropertyReport,
    VerificationRequest,
    PropertyAnalyticsEvent,
    SavedSearch,
    State,
    LGA,
)
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyImageSerializer,
    PropertyDocumentSerializer,
    PropertyReportSerializer,
    SavedSearchSerializer,
    StateSerializer,
    LGASerializer,
)

logger = logging.getLogger(__name__)


class PropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanListProperties]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = PropertyFilter
    ordering_fields = ['price', 'land_size', 'created_at', 'view_count']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        if self.action == 'my_listings':
            user = self.request.user
            if not user.is_authenticated:
                return PropertyListing.objects.none()
            return (
                PropertyListing.objects
                .select_related('realtor', 'landlord', 'developer', 'architect', 'state_ref', 'lga_ref')
                .prefetch_related('images', 'documents')
                .filter(
                    models.Q(realtor__user=user) |
                    models.Q(landlord__user=user) |
                    models.Q(developer__user=user) |
                    models.Q(architect__user=user)
                )
            )
        return (
            PropertyListing.objects
            .select_related('realtor', 'landlord', 'developer', 'architect', 'state_ref', 'lga_ref')
            .prefetch_related('images', 'documents')
            .exclude(status=PropertyListing.Status.UNDER_REVIEW)
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateSerializer
        return PropertyDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        extra_kwargs = {}
        if hasattr(user, 'realtor_profile'):
            extra_kwargs['realtor'] = user.realtor_profile
        elif hasattr(user, 'landlord_profile'):
            extra_kwargs['landlord'] = user.landlord_profile
        elif hasattr(user, 'developer_profile'):
            extra_kwargs['developer'] = user.developer_profile
        elif hasattr(user, 'architect_profile'):
            extra_kwargs['architect'] = user.architect_profile
        serializer.save(**extra_kwargs)

    @action(detail=False, methods=['get'], url_path='my-listings', permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_properties = (
            PropertyListing.objects
            .filter(status=PropertyListing.Status.AVAILABLE, is_featured=True)
            .select_related('realtor', 'state_ref', 'lga_ref')
            .prefetch_related('images', 'documents')
            .order_by('-created_at')[:8]
        )
        serializer = PropertyListSerializer(featured_properties, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def report(self, request, pk=None):
        """
        POST /api/v1/properties/<id>/report/
        Community fraud & trust reporting endpoint with auto-moderation.
        """
        property_obj = self.get_object()
        serializer = PropertyReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(
            property_listing=property_obj,
            reporter=request.user if request.user.is_authenticated else None,
        )

        # Auto-moderation thresholds
        pending_reports_count = property_obj.reports.filter(status=PropertyReport.Status.PENDING).count()
        if pending_reports_count >= 5:
            property_obj.status = PropertyListing.Status.UNDER_REVIEW
            property_obj.is_under_review = True
            property_obj.save(update_fields=['status', 'is_under_review'])
        elif pending_reports_count >= 3:
            property_obj.is_under_review = True
            property_obj.save(update_fields=['is_under_review'])

        return Response({
            'message': 'Report submitted successfully. Our trust and safety team will investigate.',
            'report_id': str(report.id),
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='images', permission_classes=[permissions.IsAuthenticated])
    def upload_images(self, request, pk=None):
        property_obj = self.get_object()
        files = request.FILES.getlist('images')
        if not files:
            return Response({'error': 'No image files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        created_images = []
        has_primary = property_obj.images.filter(is_primary=True).exists()
        for i, f in enumerate(files):
            img = PropertyImage.objects.create(
                property_listing=property_obj,
                image=f,
                is_primary=(not has_primary and i == 0),
            )
            created_images.append(img)

        serializer = PropertyImageSerializer(created_images, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='upload-document', permission_classes=[permissions.IsAuthenticated])
    def upload_document(self, request, pk=None):
        property_obj = self.get_object()
        file_obj = request.FILES.get('file')
        doc_type = request.data.get('document_type', 'other')

        if not file_obj:
            return Response({'error': 'No document file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        doc = PropertyDocument.objects.create(
            property_listing=property_obj,
            document_type=doc_type,
            file=file_obj,
            is_verified=False
        )

        if doc_type == 'c_of_o':
            property_obj.has_c_of_o = True
        elif doc_type == 'survey_plan':
            property_obj.has_survey_plan = True
        property_obj.save()

        serializer = PropertyDocumentSerializer(doc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='request-verification', permission_classes=[permissions.IsAuthenticated])
    def request_verification(self, request, pk=None):
        property_obj = self.get_object()
        req = VerificationRequest.objects.create(
            requester=request.user,
            property_listing=property_obj,
            status=VerificationRequest.Status.PENDING,
            fee_charged=10000.00
        )
        return Response({'message': 'Title verification request submitted successfully.', 'request_id': str(req.id)})

    @action(detail=False, methods=['get'], url_path='my-verifications', permission_classes=[permissions.IsAuthenticated])
    def my_verifications(self, request):
        reqs = VerificationRequest.objects.filter(requester=request.user)
        data = [{
            'id': str(r.id),
            'property_id': str(r.property_listing.id),
            'property_title': r.property_listing.title,
            'status': r.status,
            'fee_charged': str(r.fee_charged),
            'created_at': r.created_at,
        } for r in reqs]
        return Response(data)

    @action(detail=True, methods=['post'], url_path='track-event', permission_classes=[permissions.AllowAny])
    def track_event(self, request, pk=None):
        property_obj = self.get_object()
        event_type = request.data.get('event_type', 'view')
        if event_type == 'view':
            PropertyListing.objects.filter(pk=property_obj.pk).update(view_count=models.F('view_count') + 1)

        PropertyAnalyticsEvent.objects.create(
            property_listing=property_obj,
            event_type=event_type,
            viewer=request.user if request.user.is_authenticated else None,
        )
        return Response({'status': 'tracked', 'event_type': event_type}, status=status.HTTP_201_CREATED)


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class LGAViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LGA.objects.select_related('state').all()
    serializer_class = LGASerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        state_id = self.request.query_params.get('state')
        if state_id:
            qs = qs.filter(state_id=state_id)
        return qs


class SavedSearchViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedSearchSerializer
    
    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user)
'''

# =====================================================================
# 14. apps/properties/urls.py (register ai-search route)
# =====================================================================
PROPERTIES_URLS = '''"""
URL patterns for the properties app.
Mounted at /api/v1/properties/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .views_ai import AIAssistantSearchView

app_name = 'properties'

router = DefaultRouter()
router.register('states', views.StateViewSet, basename='state')
router.register('lgas', views.LGAViewSet, basename='lga')
router.register('saved-searches', views.SavedSearchViewSet, basename='saved-search')
router.register('', views.PropertyViewSet, basename='property')

urlpatterns = [
    path('ai-search/', AIAssistantSearchView.as_view(), name='property-ai-search'),
    path('', include(router.urls)),
]
'''

# =====================================================================
# 15. apps/properties/admin.py (register PropertyReport)
# =====================================================================
PROPERTIES_ADMIN = '''"""Admin configuration for the properties app."""
from django.contrib import admin
from .models import (
    PropertyListing,
    PropertyImage,
    PropertyView,
    PropertyDocument,
    VerificationRequest,
    PropertyAnalyticsEvent,
    SavedSearch,
    PropertyReport,
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ('id', 'uploaded_at')


@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'land_size', 'location', 'status', 'is_under_review', 'view_count', 'created_at')
    list_filter = ('status', 'is_under_review', 'state', 'created_at')
    search_fields = ('title', 'description', 'location', 'state')
    readonly_fields = ('id', 'view_count', 'search_vector', 'created_at', 'updated_at')
    raw_id_fields = ('realtor', 'landlord', 'developer', 'architect')
    inlines = [PropertyImageInline]
    list_per_page = 25


@admin.register(PropertyReport)
class PropertyReportAdmin(admin.ModelAdmin):
    list_display = ('property_listing', 'reason', 'status', 'reporter', 'contact_email', 'created_at')
    list_filter = ('status', 'reason', 'created_at')
    search_fields = ('property_listing__title', 'description', 'contact_email', 'reporter__email')
    readonly_fields = ('id', 'created_at')
    actions = ['mark_resolved', 'mark_under_review']

    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
        self.message_user(request, "Selected fraud reports marked as resolved.")
    mark_resolved.short_description = "Mark Selected Reports as Resolved"

    def mark_under_review(self, request, queryset):
        queryset.update(status='under_review')
        self.message_user(request, "Selected fraud reports marked under investigation.")
    mark_under_review.short_description = "Mark Selected Reports as Under Investigation"


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property_listing', 'caption', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)
    raw_id_fields = ('property_listing',)


@admin.register(PropertyDocument)
class PropertyDocumentAdmin(admin.ModelAdmin):
    list_display = ('property_listing', 'document_type', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified')
    raw_id_fields = ('property_listing',)


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ('property_listing', 'requester', 'status', 'fee_charged', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('property_listing__title', 'requester__email', 'report_notes')
    readonly_fields = ('id', 'fee_charged', 'created_at', 'updated_at')
'''

# =====================================================================
# Main execution function
# =====================================================================
def main():
    print(f"🚀 Updating backend in {BACKEND_DIR}...")
    if not os.path.exists(BACKEND_DIR):
        print(f"❌ Backend directory not found at {BACKEND_DIR}")
        sys.exit(1)

    # 1. Escrows
    write_backend_file("apps/escrows/models.py", ESCROWS_MODELS)
    write_backend_file("apps/escrows/serializers.py", ESCROWS_SERIALIZERS)
    write_backend_file("apps/escrows/views.py", ESCROWS_VIEWS)
    write_backend_file("apps/escrows/admin.py", ESCROWS_ADMIN)

    # 2. Wallets
    write_backend_file("apps/wallets/models.py", WALLETS_MODELS)
    write_backend_file("apps/wallets/serializers.py", WALLETS_SERIALIZERS)
    write_backend_file("apps/wallets/views.py", WALLETS_VIEWS)
    write_backend_file("apps/wallets/admin.py", WALLETS_ADMIN)

    # 3. Accounts
    write_backend_file("apps/accounts/serializers.py", ACCOUNTS_SERIALIZERS)

    # 4. Properties
    write_backend_file("apps/properties/models.py", PROPERTIES_MODELS)
    write_backend_file("apps/properties/serializers.py", PROPERTIES_SERIALIZERS)
    write_backend_file("apps/properties/filters.py", PROPERTIES_FILTERS)
    write_backend_file("apps/properties/views.py", PROPERTIES_VIEWS)
    write_backend_file("apps/properties/urls.py", PROPERTIES_URLS)
    write_backend_file("apps/properties/admin.py", PROPERTIES_ADMIN)

    print("\n🎉 All backend files successfully synchronized directly into real_estate_api!")

if __name__ == "__main__":
    main()
