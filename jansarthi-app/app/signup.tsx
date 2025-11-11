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

export default function SignupScreen() {
  const { signup, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSignup = async () => {
    try {
      clearError();
      setLocalError('');

      // Basic validation
      if (!name.trim()) {
        setLocalError('Please enter your name');
        return;
      }
      if (!mobileNumber.trim()) {
        setLocalError('Please enter your mobile number');
        return;
      }

      // Send OTP
      const response = await signup({
        name: name.trim(),
        mobile_number: mobileNumber,
      });
      
      // Navigate to OTP verification screen
      router.push({
        pathname: '/verify-otp',
        params: {
          mobile_number: mobileNumber,
          expires_in: response.expires_in_minutes.toString(),
          flow: 'signup',
        },
      });
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      <VStack space="xl" className="flex-1 justify-center">
        <VStack space="md" className="items-center mb-8">
          <Heading size="2xl" className="text-center">
            Create Account
          </Heading>
          <Text size="md" className="text-gray-600 text-center">
            Enter your details to get started
          </Text>
        </VStack>

        <VStack space="lg">
          <FormControl isInvalid={!!localError || !!error}>
            <VStack space="md">
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setLocalError('');
                    clearError();
                  }}
                  autoFocus
                />
              </Input>

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
            onPress={handleSignup}
            isDisabled={isLoading}
            className="bg-blue-600"
          >
            <ButtonText>{isLoading ? 'Creating Account...' : 'Sign Up'}</ButtonText>
          </Button>

          <View className="flex-row justify-center items-center mt-4">
            <Text size="sm" className="text-gray-600">
              Already have an account?{' '}
            </Text>
            <Button
              variant="link"
              size="sm"
              onPress={() => router.push('/login')}
            >
              <ButtonText className="text-blue-600">Login</ButtonText>
            </Button>
          </View>
        </VStack>
      </VStack>
    </View>
  );
}
