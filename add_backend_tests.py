#!/usr/bin/env python3
import os

BACKEND_DIR = "/home/victor/Desktop/real_estate_api"

def write_backend_file(rel_path, content):
    full_path = os.path.join(BACKEND_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Created: {full_path}")

ESCROW_TESTS = '''from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from escrows.models import EscrowTransaction, EscrowMediation
from properties.models import PropertyListing
from realtors.models import RealtorProfile
from wallets.models import Wallet

User = get_user_model()


class EscrowDualConfirmationTests(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            email='buyer@example.com',
            password='testpassword123',
            first_name='Buyer',
            last_name='User',
            role='buyer'
        )
        self.seller = User.objects.create_user(
            email='seller@example.com',
            password='testpassword123',
            first_name='Seller',
            last_name='User',
            role='realtor'
        )
        self.buyer_wallet = Wallet.objects.get_or_create(user=self.buyer)[0]
        self.buyer_wallet.balance = Decimal('10000000.00')
        self.buyer_wallet.save()

        self.seller_wallet = Wallet.objects.get_or_create(user=self.seller)[0]
        self.seller_wallet.balance = Decimal('0.00')
        self.seller_wallet.save()

        self.realtor_profile, _ = RealtorProfile.objects.get_or_create(
            user=self.seller,
            defaults={'company_name': 'Premier Estates'}
        )

        self.property = PropertyListing.objects.create(
            realtor=self.realtor_profile,
            title='Prime Waterfront Plot, Lekki Phase 1',
            description='Prime residential plot with C of O',
            price=Decimal('5000000.00'),
            state='Lagos',
            location='Lekki Phase 1',
            property_category='land',
            land_size=Decimal('600.00'),
            status='active'
        )

        self.escrow = EscrowTransaction.objects.create(
            buyer=self.buyer,
            seller=self.seller,
            property_listing=self.property,
            amount=Decimal('5000000.00'),
            status='pending'
        )

    def test_seller_accepts_escrow_locks_funds(self):
        self.client.force_authenticate(user=self.seller)
        url = reverse('escrow-accept', kwargs={'pk': self.escrow.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.escrow.refresh_from_db()
        self.assertEqual(self.escrow.status, 'escrowed')

        self.buyer_wallet.refresh_from_db()
        self.assertEqual(self.buyer_wallet.balance, Decimal('5000000.00'))

    def test_dual_confirmation_releases_funds_when_both_confirm(self):
        # Move escrow to escrowed state
        self.escrow.status = 'escrowed'
        self.escrow.save()

        # Buyer confirms
        self.client.force_authenticate(user=self.buyer)
        confirm_url = reverse('escrow-confirm', kwargs={'pk': self.escrow.id})
        res1 = self.client.post(confirm_url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        self.escrow.refresh_from_db()
        self.assertTrue(self.escrow.buyer_confirmed)
        self.assertFalse(self.escrow.seller_confirmed)
        self.assertEqual(self.escrow.status, 'escrowed')  # Still waiting for seller

        # Seller confirms
        self.client.force_authenticate(user=self.seller)
        res2 = self.client.post(confirm_url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        self.escrow.refresh_from_db()
        self.assertTrue(self.escrow.buyer_confirmed)
        self.assertTrue(self.escrow.seller_confirmed)
        self.assertEqual(self.escrow.status, 'completed')

        # Seller wallet received funds
        self.seller_wallet.refresh_from_db()
        self.assertEqual(self.seller_wallet.balance, Decimal('5000000.00'))

    def test_discrepancy_rejection_opens_automatic_mediation(self):
        # Move escrow to escrowed state
        self.escrow.status = 'escrowed'
        self.escrow.save()

        # Buyer confirms
        self.client.force_authenticate(user=self.buyer)
        confirm_url = reverse('escrow-confirm', kwargs={'pk': self.escrow.id})
        self.client.post(confirm_url)

        # Seller rejects / reports discrepancy
        self.client.force_authenticate(user=self.seller)
        reject_url = reverse('escrow-reject-confirmation', kwargs={'pk': self.escrow.id})
        res = self.client.post(reject_url, {
            'reason': 'Deed of Assignment signature discrepancy noted upon inspection.'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.escrow.refresh_from_db()
        self.assertEqual(self.escrow.status, 'in_mediation')
        self.assertTrue(self.escrow.in_mediation)

        # Mediation record created
        mediation = EscrowMediation.objects.filter(escrow=self.escrow).first()
        self.assertIsNotNone(mediation)
        self.assertEqual(mediation.status, 'opened')
        self.assertIn('signature discrepancy', mediation.reason)
'''

WALLET_TESTS = '''from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from wallets.models import Wallet, WalletTransaction

User = get_user_model()


class WalletOperationsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='walletuser@example.com',
            password='testpassword123',
            first_name='Victor',
            last_name='Marshall',
            role='buyer'
        )
        self.wallet = Wallet.objects.get_or_create(user=self.user)[0]
        self.wallet.balance = Decimal('100000.00')
        self.wallet.save()

    def test_get_virtual_account(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('wallet-virtual-account')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('account_number', response.data)
        self.assertIn('bank_name', response.data)
        self.assertEqual(len(response.data['account_number']), 10)

    def test_get_nigerian_banks_list(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('wallet-banks')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 5)
        codes = [b['code'] for b in response.data]
        self.assertIn('058', codes)  # GTBank
        self.assertIn('033', codes)  # UBA

    def test_successful_bank_withdrawal(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('wallet-withdraw')
        payload = {
            'amount': '25000.00',
            'bank_name': 'Guaranty Trust Bank (GTBank)',
            'account_number': '0123456789',
            'account_name': 'Victor Marshall'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('75000.00'))

        tx = WalletTransaction.objects.filter(wallet=self.wallet, transaction_type='withdrawal').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, Decimal('25000.00'))
        self.assertEqual(tx.bank_name, 'Guaranty Trust Bank (GTBank)')

    def test_insufficient_funds_withdrawal_fails(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('wallet-withdraw')
        payload = {
            'amount': '500000.00',  # Exceeds 100k balance
            'bank_name': 'Access Bank',
            'account_number': '0123456789',
            'account_name': 'Victor Marshall'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('100000.00'))
'''

PROPERTY_TESTS = '''from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from properties.models import PropertyListing, PropertyReport
from realtors.models import RealtorProfile

User = get_user_model()


class PropertyTrustAndSafetyTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email='seller2@example.com',
            password='testpassword123',
            first_name='Agent',
            last_name='Ade',
            role='realtor'
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            password='testpassword123',
            first_name='John',
            last_name='Doe',
            role='buyer'
        )
        self.realtor_profile, _ = RealtorProfile.objects.get_or_create(
            user=self.seller,
            defaults={'company_name': 'Ade Properties'}
        )
        self.property = PropertyListing.objects.create(
            realtor=self.realtor_profile,
            title='Suspicious Plot, Ibeju Lekki',
            description='Cheap land with unverified document claims',
            price=Decimal('1500000.00'),
            state='Lagos',
            location='Ibeju Lekki',
            property_category='land',
            land_size=Decimal('500.00'),
            status='active'
        )

    def test_report_listing_creates_property_report(self):
        self.client.force_authenticate(user=self.reporter)
        url = reverse('properties:property-report', kwargs={'pk': self.property.id})
        payload = {
            'reason': 'fake_agent',
            'description': 'Survey plan number does not exist in state surveyor general records.',
            'contact_email': 'reporter@example.com'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        report = PropertyReport.objects.filter(property_listing=self.property).first()
        self.assertIsNotNone(report)
        self.assertEqual(report.reason, 'fake_agent')

    def test_auto_moderation_threshold_flags_property_review(self):
        # Create 3 reports to test the threshold
        for i in range(3):
            u = User.objects.create_user(
                email=f'user{i}@example.com',
                password='testpassword123'
            )
            self.client.force_authenticate(user=u)
            url = reverse('properties:property-report', kwargs={'pk': self.property.id})
            self.client.post(url, {'reason': 'suspicious_payment', 'description': 'Demanded cash payment outside escrow'})

        self.property.refresh_from_db()
        self.assertTrue(self.property.is_under_review)
'''

def main():
    write_backend_file("apps/escrows/tests.py", ESCROW_TESTS)
    write_backend_file("apps/wallets/tests.py", WALLET_TESTS)
    write_backend_file("apps/properties/tests.py", PROPERTY_TESTS)
    print("✨ All backend test suites synchronized.")

if __name__ == "__main__":
    main()
