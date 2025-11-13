/**
 * Terms of Service Page
 *
 * Displays the terms of service for AI Ideas Hub.
 * Public page accessible to all users.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using AI Ideas Hub ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground">
                AI Ideas Hub is a platform that provides curated AI project ideas for professionals. The Platform offers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access to 87 curated AI project ideas</li>
                <li>Community features including comments and project sharing</li>
                <li>Educational content and resources</li>
                <li>Campaign-related promotions and challenges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-2">3.1 Registration</h3>
              <p className="text-muted-foreground">
                To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Account Security</h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                <li>Post, upload, or transmit any content that is harmful, offensive, or violates the rights of others</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
                <li>Interfere with or disrupt the Platform or servers or networks connected to the Platform</li>
                <li>Attempt to gain unauthorized access to any portion of the Platform or any other accounts, computer systems, or networks</li>
                <li>Use any robot, spider, or other automatic device to access the Platform</li>
                <li>Collect or harvest any personally identifiable information from the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User-Generated Content</h2>
              <h3 className="text-xl font-semibold mb-2">5.1 Ownership</h3>
              <p className="text-muted-foreground">
                You retain ownership of any content you post, upload, or submit to the Platform ("User Content"). By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content for the purpose of operating and promoting the Platform.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Content Standards</h3>
              <p className="text-muted-foreground">
                You are solely responsible for your User Content. We reserve the right to remove any User Content that violates these Terms or that we determine, in our sole discretion, is harmful, offensive, or inappropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Platform and its original content, features, and functionality are owned by AI Ideas Hub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not modify, reproduce, distribute, or create derivative works based on our content without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground">
                The Platform may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by or in connection with the use of any such content or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE PLATFORM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to defend, indemnify, and hold harmless AI Ideas Hub and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Platform or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us through your account settings or by emailing us at the contact information provided on our platform.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

