# Phase 4 Backend Updates (`real_estate_api`)

To support Phase 4 (AI Property Search Assistant endpoint), add the following view and URL route to `/home/victor/Desktop/real_estate_api`:

---

### 1. Create `apps/properties/views_ai.py`
Create `apps/properties/views_ai.py` with:

```python
"""
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

        # 1. Parse budget in millions (e.g., 15m, 15 million, 120m)
        million_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|million|milli)', q_lower)
        if million_match:
            budget = float(million_match.group(1)) * 1_000_000
            queryset = queryset.filter(price__lte=budget)

        # 2. Location filter matches
        for state_name in ['lagos', 'abuja', 'delta', 'rivers', 'oyo', 'enugu', 'asaba', 'lekki', 'epe', 'maitama', 'ikoyi']:
            if state_name in q_lower:
                queryset = queryset.filter(
                    Q(state__icontains=state_name) |
                    Q(location__icontains=state_name) |
                    Q(title__icontains=state_name)
                )

        # 3. Document keywords (C of O, Survey)
        if 'c of o' in q_lower or 'co of o' in q_lower:
            queryset = queryset.filter(has_c_of_o=True)
        if 'survey' in q_lower:
            queryset = queryset.filter(has_survey_plan=True)

        # Order by verified titles first
        results = queryset.order_by('-is_title_verified', '-created_at')[:4]
        serialized = PropertyListSerializer(results, many=True, context={'request': request}).data

        return Response({
            'query': query,
            'match_count': len(serialized),
            'results': serialized,
            'summary': f"Found {len(serialized)} matching verified properties."
        }, status=status.HTTP_200_OK)
```

---

### 2. Add Route to `apps/properties/urls.py`

```python
from .views_ai import AIAssistantSearchView

urlpatterns = [
    ...
    path('ai-search/', AIAssistantSearchView.as_view(), name='property-ai-search'),
]
```
