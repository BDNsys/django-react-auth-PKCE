# views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # The RegisterSerializer.to_representation now returns user + tokens
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED
        )




class GoogleLoginView(APIView):
    def post(self, request):
        code = request.data.get('code')
        verifier = request.data.get('code_verifier')
        
        # Google's token endpoint
        token_url = settings.GOOGLE_TOKEN_URL
        data = {
            "code": code,
            "code_verifier": verifier,
            "client_id": settings.SOCIAL_AUTH_GOOGLE_CLIENT_ID,
            "client_secret": settings.SOCIAL_AUTH_GOOGLE_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URL,
            "grant_type": "authorization_code",
        }
        
        # 1. Exchange code for Google Access Token
        google_resp = requests.post(token_url, data=data).json()
        access_token = google_resp.get('access_token')

        # 2. (Optional) Get user info to create/login user in Django
        user_info = requests.get(
            settings.GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()

        #TODO: get or create user and return a JWT or DRF Token
        user, created = User.objects.get_or_create(
            email=user_info['email'],
            defaults={
                'first_name': user_info.get('given_name', ''),
                'last_name': user_info.get('family_name', ''),
            }
        )

        # Generate JWT token
        token = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(token),
            'access': str(token.access_token),
        })

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": f"Welcome back, {request.user.first_name or request.user.email}!",
            "timestamp": "2026-02-12T15:15:00Z",
            "stats": {
                "users": 1234,
                "sessions": 567,
                "revenue": 12345,
                "performance": 98.5
            }
        })

