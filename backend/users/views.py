# views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        # Use registration serializer for POST, profile serializer for GET/PUT
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer

    def get_permissions(self):
        # Allow anyone to register, but only authenticated users to view profiles
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # The RegisterSerializer.to_representation now returns user + tokens
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED
        )