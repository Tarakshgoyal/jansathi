import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    try {
      clearError();
      setLocalError('');

      // Basic validation
      if (!mobileNumber.trim()) {
        setLocalError('Please enter your mobile number');
        return;
      }

      // Send OTP
      const response = await login({ mobile_number: mobileNumber });
      
      // Navigate to OTP verification screen
      router.push({
        pathname: '/verify-otp',
        params: {
          mobile_number: mobileNumber,
          expires_in: response.expires_in_minutes.toString(),
          flow: 'login',
        },
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      <VStack space="xl" className="flex-1 justify-center">
        <VStack space="md" className="items-center mb-8">
          <Heading size="2xl" className="text-center">
            Welcome Back
          </Heading>
          <Text size="md" className="text-gray-600 text-center">
            Enter your mobile number to login
          </Text>
        </VStack>

        <VStack space="lg">
          <FormControl isInvalid={!!localError || !!error}>
            <VStack space="sm">
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Mobile Number"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={(text) => {
                    setMobileNumber(text);
                    setLocalError('');
                    clearError();
                  }}
                  autoFocus
                />
              </Input>
              {(localError || error) && (
                <Text size="sm" className="text-red-500">
                  {localError || error}
                </Text>
              )}
            </VStack>
          </FormControl>

          <Button
            size="lg"
            onPress={handleLogin}
            isDisabled={isLoading}
            className="bg-blue-600"
          >
            <ButtonText>{isLoading ? 'Sending OTP...' : 'Send OTP'}</ButtonText>
          </Button>

          <View className="flex-row justify-center items-center mt-4">
            <Text size="sm" className="text-gray-600">
              Don't have an account?{' '}
            </Text>
            <Button
              variant="link"
              size="sm"
              onPress={() => router.push('/signup')}
            >
              <ButtonText className="text-blue-600">Sign Up</ButtonText>
            </Button>
          </View>
        </VStack>
      </VStack>
    </View>
  );
}
