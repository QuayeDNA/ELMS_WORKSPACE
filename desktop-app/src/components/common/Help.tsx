import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Help: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <HelpCircle className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Find answers and get support</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Documentation
            </CardTitle>
            <CardDescription>Learn how to use the system effectively</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Getting Started</h4>
              <p className="text-sm text-muted-foreground">
                Learn the basics of using the ELMS system
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Guide
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Manual</h4>
              <p className="text-sm text-muted-foreground">
                Complete reference for all features
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Support
            </CardTitle>
            <CardDescription>Get help from our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Contact Support</h4>
              <p className="text-sm text-muted-foreground">
                Need help? Our support team is here to assist you
              </p>
              <Button size="sm" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">FAQ</h4>
              <p className="text-sm text-muted-foreground">
                Find answers to commonly asked questions
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Useful resources and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Book className="w-6 h-6" />
              <span className="text-sm">API Documentation</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">Community Forum</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <ExternalLink className="w-6 h-6" />
              <span className="text-sm">System Status</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
