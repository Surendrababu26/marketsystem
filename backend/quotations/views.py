from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quotation
from .serializers import QuotationSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-created_at')
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(supplier=self.request.user)

    @action(detail=False, methods=['get'])
    def my(self, request):
        quotations = Quotation.objects.filter(supplier=request.user).order_by('-created_at')
        serializer = self.get_serializer(quotations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='rfq/(?P<rfq_id>\d+)')
    def by_rfq(self, request, rfq_id=None):
        quotations = Quotation.objects.filter(rfq_id=rfq_id).order_by('-created_at')
        serializer = self.get_serializer(quotations, many=True)
        return Response(serializer.data)
