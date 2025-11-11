import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyOTPScreen() {
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();
  const params = useLocalSearchParams<{
    mobile_number: string;
    expires_in: string;
    flow: 'login' | 'signup';
  }>();

  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Start countdown timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async () => {
    try {
      clearError();
      setLocalError('');

      // Basic validation
      if (!otpCode.trim()) {
        setLocalError('Please enter the OTP');
        return;
      }
      if (otpCode.length !== 6) {
        setLocalError('OTP must be 6 digits');
        return;
      }

      // Verify OTP
      await verifyOTP({
        mobile_number: params.mobile_number,
        otp_code: otpCode,
      });

      // Navigate to home screen after successful verification
      router.replace('/');
    } catch (err) {
      console.error('OTP verification error:', err);
    }
  };

  const handleResendOTP = async () => {
    try {
      clearError();
      setLocalError('');
      
      await resendOTP(params.mobile_number);
      
      // Reset timer
      setResendTimer(60);
      setCanResend(false);
      setOtpCode('');
    } catch (err) {
      console.error('Resend OTP error:', err);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      <VStack space="xl" className="flex-1 justify-center">
        <VStack space="md" className="items-center mb-8">
          <Heading size="2xl" className="text-center">
            Verify OTP
          </Heading>
          <Text size="md" className="text-gray-600 text-center">
            Enter the 6-digit code sent to
          </Text>
          <Text size="md" className="font-semibold text-center">
            {params.mobile_number}
          </Text>
          <Text size="sm" className="text-gray-500 text-center mt-2">
            OTP expires in {params.expires_in} minutes
          </Text>
        </VStack>

        <VStack space="lg">
          <FormControl isInvalid={!!localError || !!error}>
            <VStack space="sm">
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={(text) => {
                    setOtpCode(text);
                    setLocalError('');
                    clearError();
                  }}
                  autoFocus
                  textAlign="center"
                  className="text-2xl tracking-widest"
                />
              </Input>
              {(localError || error) && (
                <Text size="sm" className="text-red-500 text-center">
                  {localError || error}
                </Text>
              )}
            </VStack>
          </FormControl>

          <Button
            size="lg"
            onPress={handleVerifyOTP}
            isDisabled={isLoading || otpCode.length !== 6}
            className="bg-blue-600"
          >
            <ButtonText>{isLoading ? 'Verifying...' : 'Verify OTP'}</ButtonText>
          </Button>

          <VStack space="sm" className="items-center mt-4">
            {!canResend ? (
              <Text size="sm" className="text-gray-600">
                Resend OTP in {resendTimer}s
              </Text>
            ) : (
              <Button
                variant="link"
                size="sm"
                onPress={handleResendOTP}
                isDisabled={isLoading}
              >
                <ButtonText className="text-blue-600">Resend OTP</ButtonText>
              </Button>
            )}
          </VStack>

          <Button
            variant="outline"
            size="md"
            onPress={() => router.back()}
            className="mt-4"
          >
            <ButtonText>Change Number</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </View>
  );
}
