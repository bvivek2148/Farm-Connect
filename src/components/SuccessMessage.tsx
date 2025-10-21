import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface SuccessMessageProps {
  title: string;
  description: string;
  redirectPath: string;
  redirectText: string;
  onRedirect: () => void;
  countdown?: number;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  description,
  redirectPath,
  redirectText,
  onRedirect,
  countdown = 3
}) => {
  const [timeLeft, setTimeLeft] = React.useState(countdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Set session storage to indicate new account
          if (redirectPath === '/login') {
            sessionStorage.setItem('newAccountCreated', 'true');
          }
          onRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-gray-900">
                {title}
              </CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-gray-600 leading-relaxed"
            >
              {description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>Redirecting in</span>
                <span className="font-semibold text-green-600">{timeLeft}</span>
                <span>seconds...</span>
              </div>
              
              <Button
                onClick={() => {
                  // Set session storage to indicate new account
                  if (redirectPath === '/login') {
                    sessionStorage.setItem('newAccountCreated', 'true');
                  }
                  onRedirect();
                }}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {redirectText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuccessMessage;