"""Twilio service for sending OTP SMS"""

import random
import re
from datetime import datetime, timedelta

from twilio.rest import Client

from app.settings.config import get_settings

settings = get_settings()


def normalize_phone_number(phone: str) -> str:
    """
    Normalize phone number to E.164 format
    
    Args:
        phone: Phone number in various formats
        
    Returns:
        str: Phone number in E.164 format (+[country_code][number])
        
    Examples:
        "9876543210" -> "+919876543210"
        "+919876543210" -> "+919876543210"
        "919876543210" -> "+919876543210"
        "+91 98765 43210" -> "+919876543210"
    """
    # Remove all non-digit characters except leading +
    if phone.startswith('+'):
        # Keep the + and remove all non-digits after it
        country_code_part = '+'
        phone = phone[1:]
        phone = re.sub(r'\D', '', phone)
        phone = country_code_part + phone
    else:
        # Remove all non-digits
        phone = re.sub(r'\D', '', phone)
        
        # If doesn't start with country code, assume India (+91)
        if not phone.startswith('91') or len(phone) == 10:
            phone = '91' + phone
        
        # Add + prefix
        phone = '+' + phone
    
    return phone


class TwilioService:
    """Service for sending SMS via Twilio"""

    def __init__(self):
        """Initialize Twilio client"""
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        # Use your actual Twilio phone number
        self.from_number = "+17248043746"

    def generate_otp(self) -> str:
        """Generate a random OTP code"""
        otp = ''.join([str(random.randint(0, 9)) for _ in range(settings.otp_length)])
        return otp

    def send_otp(self, to_number: str, otp_code: str) -> bool:
        """
        Send OTP via SMS
        
        Args:
            to_number: Recipient phone number (will be normalized to E.164 format)
            otp_code: OTP code to send
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Normalize phone number to E.164 format
            normalized_number = normalize_phone_number(to_number)
            
            message_body = f"Your Jansarthi verification code is: {otp_code}\n\nThis code will expire in {settings.otp_expiry_minutes} minutes.\n\nDo not share this code with anyone."
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=normalized_number
            )
            
            print(f"SMS sent successfully to {normalized_number}. SID: {message.sid}")
            return True
            
        except Exception as e:
            print(f"Error sending SMS to {to_number}: {str(e)}")
            return False

    def send_welcome_message(self, to_number: str, name: str) -> bool:
        """
        Send welcome message to new user
        
        Args:
            to_number: Recipient phone number (will be normalized to E.164 format)
            name: User's name
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Normalize phone number to E.164 format
            normalized_number = normalize_phone_number(to_number)
            
            message_body = f"Welcome to Jansarthi, {name}! 🎉\n\nThank you for joining us. You can now report civic issues in your area and help make your community better."
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=normalized_number
            )
            
            print(f"Welcome SMS sent successfully to {normalized_number}. SID: {message.sid}")
            return True
            
        except Exception as e:
            print(f"Error sending welcome SMS to {to_number}: {str(e)}")
            return False


# Singleton instance
_twilio_service = None


def get_twilio_service() -> TwilioService:
    """Get Twilio service instance"""
    global _twilio_service
    if _twilio_service is None:
        _twilio_service = TwilioService()
    return _twilio_service
