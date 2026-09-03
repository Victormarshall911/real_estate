# Phase 3 Backend Updates (`real_estate_api`)

To support Phase 3 (Algorithmic Property Investment Scoring), add the following service and serializer extensions to `/home/victor/Desktop/real_estate_api`:

---

### 1. Create `apps/properties/services/scoring.py`
Create `apps/properties/services/scoring.py` with:

```python
"""
Scoring engine for Property Investment Potential and Passport Trust Scores.
"""

def calculate_property_investment_score(property_listing):
    """
    Computes a 0-100 algorithmic score assessing the investment potential of a listing.
    
    Weights:
    - Title Security: up to 35 points
    - Infrastructure & Utilities: up to 25 points
    - Price-to-Value Index: up to 20 points
    - Seller / Developer Verification: up to 20 points
    """
    # 1. Title Security (Max 35)
    title_score = 15
    if property_listing.has_c_of_o:
        title_score = 35
    elif property_listing.has_survey_plan:
        title_score = 25
    if property_listing.is_title_verified:
        title_score = min(35, title_score + 5)

    # 2. Infrastructure & Amenities (Max 25)
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

    # 3. Seller Verification (Max 20)
    seller_score = 10
    seller = property_listing.realtor or property_listing.landlord or property_listing.developer
    if seller and getattr(seller, 'is_verified', False):
        seller_score = 20

    # 4. Geolocation & Value Index (Max 20)
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
```

---

### 2. Include in `PropertyDetailSerializer` (`apps/properties/serializers.py`):

```python
from .services.scoring import calculate_property_investment_score

class PropertyDetailSerializer(serializers.ModelSerializer):
    ...
    investment_metrics = serializers.SerializerMethodField()

    def get_investment_metrics(self, obj):
        return calculate_property_investment_score(obj)
```
