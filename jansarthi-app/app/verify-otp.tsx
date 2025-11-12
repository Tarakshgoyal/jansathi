import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function VerifyOTPScreen() {
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();
  const { getText, t } = useLanguage();
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
        setLocalError(getText(t.auth.verifyOtp.enterOtp));
        return;
      }
      if (otpCode.length !== 6) {
        setLocalError(getText(t.auth.verifyOtp.otpMustBe6Digits));
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
    <View className="flex-1 bg-brand-500">
      {/* Header Section with Brand Color */}
      <View className="pt-16 pb-8 px-6">
        <VStack space="md" className="items-center mt-8">
          <Heading size="3xl" className="text-typography-white text-center font-bold">
            {getText(t.auth.verifyOtp.title)}
          </Heading>
          <Text size="md" className="text-typography-white text-center opacity-90">
            {getText(t.auth.verifyOtp.subtitle)}
          </Text>
          <Text size="lg" className="text-typography-white font-semibold text-center">
            {params.mobile_number}
          </Text>
          <Text size="sm" className="text-typography-white text-center opacity-80 mt-2">
            {getText(t.auth.verifyOtp.otpExpiresIn)} {params.expires_in} {getText(t.auth.verifyOtp.minutes)}
          </Text>
        </VStack>
      </View>

      {/* Content Card */}
      <View className="flex-1 bg-background-0 rounded-t-3xl px-6 pt-8">
        <VStack space="lg" className="flex-1">
          <FormControl isInvalid={!!localError || !!error}>
            <VStack space="sm">
              <Input 
                variant="outline" 
                size="lg"
                className="bg-background-50 border-outline-200"
              >
                <InputField
                  placeholder={getText(t.auth.verifyOtp.enterOtpPlaceholder)}
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
                  className="text-2xl tracking-widest text-typography-900"
                />
              </Input>
              {(localError || error) && (
                <Text size="sm" className="text-error-500 text-center">
                  {localError || error}
                </Text>
              )}
            </VStack>
          </FormControl>

          <Button
            size="lg"
            onPress={handleVerifyOTP}
            isDisabled={isLoading || otpCode.length !== 6}
            className="bg-brand-500 rounded-lg shadow-sm"
          >
            <ButtonText className="text-typography-white font-semibold">
              {isLoading ? getText(t.auth.verifyOtp.verifying) : getText(t.auth.verifyOtp.verifyOtp)}
            </ButtonText>
          </Button>

          <VStack space="sm" className="items-center mt-4">
            {!canResend ? (
              <Text size="sm" className="text-typography-500">
                {getText(t.auth.verifyOtp.resendOtpIn)} {resendTimer}s
              </Text>
            ) : (
              <Button
                variant="link"
                size="sm"
                onPress={handleResendOTP}
                isDisabled={isLoading}
              >
                <ButtonText className="text-brand-500 font-semibold">
                  {getText(t.auth.verifyOtp.resendOtp)}
                </ButtonText>
              </Button>
            )}
          </VStack>

          <Button
            variant="outline"
            size="md"
            onPress={() => router.back()}
            className="mt-4 border-outline-200"
          >
            <ButtonText className="text-typography-900">
              {getText(t.auth.verifyOtp.changeNumber)}
            </ButtonText>
          </Button>
        </VStack>
      </View>
    </View>
  );
}
