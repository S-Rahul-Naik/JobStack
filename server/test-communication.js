// Test script to demonstrate the communication system
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCommunicationSystem() {
  console.log('🚀 Testing JobStack Communication System with AI Monitoring\n');

  try {
    // 1. Login as recruiter
    console.log('1. 👤 Logging in as recruiter...');
    const recruiterLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testrecruiter@demo.com',
      password: 'demo123'
    });
    
    const recruiterToken = recruiterLogin.data.token;
    console.log('✅ Recruiter logged in successfully');

    // 2. Get recruiter's jobs and applications
    console.log('\n2. 📋 Getting recruiter\'s jobs...');
    const jobsResponse = await axios.get(`${API_BASE}/jobs/my`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    
    const jobs = jobsResponse.data;
    if (!jobs || jobs.length === 0) {
      console.log('❌ No jobs found for this recruiter');
      return;
    }

    const firstJob = jobs[0];
    console.log(`✅ Found job: "${firstJob.title}"`);

    // 3. Get applications for this job
    console.log('\n3. 📋 Getting applications for the job...');
    const applicationsResponse = await axios.get(`${API_BASE}/jobs/applicants/all`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });

    const applications = applicationsResponse.data;
    if (!applications || applications.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    const firstApplication = applications[0];
        // 4. Shortlist the applicant (this should auto-start conversation)
    console.log(`
4. 🎯 Shortlisting applicant: ${firstApplication.applicantId.name}`);
    
    // Shortlist the applicant (this should auto-start conversation)
    const shortlistResponse = await axios.patch(
      `${API_BASE}/jobs/applicants/${firstApplication._id}/status`,
      { status: 'shortlisted' },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    console.log('✅ Applicant shortlisted successfully');
    console.log('🎉 Conversation auto-started:', shortlistResponse.data.conversationStarted);

    // 4. Get conversations
    console.log('\n4. 💬 Getting recruiter\'s conversations...');
    const conversations = await axios.get(`${API_BASE}/communication/conversations`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });

    console.log(`✅ Found ${conversations.data.conversations.length} conversation(s)`);

    if (conversations.data.conversations.length > 0) {
      const conversation = conversations.data.conversations[0];
      console.log(`📍 Conversation between ${conversation.recruiterId.name} and ${conversation.applicantId.name}`);

      // 5. Send a test message with AI analysis
      console.log('\n5. 🤖 Testing AI monitoring with different message types...\n');

      // Test normal message
      console.log('📝 Sending normal message...');
      const normalMessage = await axios.post(`${API_BASE}/communication/messages`, {
        conversationId: conversation._id,
        content: 'Thank you for your application. When would be a good time for an interview?'
      }, {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });

      console.log('✅ Normal message sent');
      console.log('🤖 AI Analysis:', {
        fraudScore: normalMessage.data.message.aiAnalysis.fraudScore,
        riskFlags: normalMessage.data.message.aiAnalysis.riskFlags
      });

      // Test suspicious message
      console.log('\n📝 Sending suspicious message (AI should flag this)...');
      const suspiciousMessage = await axios.post(`${API_BASE}/communication/messages`, {
        conversationId: conversation._id,
        content: 'Congratulations! You got the job. Please send $200 registration fee to my bank account immediately to secure your position.'
      }, {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });

      console.log('⚠️  Suspicious message sent');
      console.log('🚨 AI Analysis:', {
        fraudScore: suspiciousMessage.data.message.aiAnalysis.fraudScore,
        riskFlags: suspiciousMessage.data.message.aiAnalysis.riskFlags,
        suspiciousKeywords: suspiciousMessage.data.message.aiAnalysis.suspiciousKeywords,
        aiWarning: suspiciousMessage.data.aiWarning
      });

      // 6. Get message history
      console.log('\n6. 📜 Getting conversation messages...');
      const messages = await axios.get(`${API_BASE}/communication/conversations/${conversation._id}/messages`, {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });

      console.log(`✅ Retrieved ${messages.data.messages.length} messages`);
      messages.data.messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.senderType}] ${msg.messageType}: ${msg.content.text?.substring(0, 50)}...`);
        if (msg.aiAnalysis.fraudScore > 0) {
          console.log(`      🤖 AI Score: ${msg.aiAnalysis.fraudScore}/100`);
        }
      });
    }

    console.log('\n🎉 Communication System Test Complete!');
    console.log('\n📊 System Features Demonstrated:');
    console.log('✅ Auto-conversation start on shortlisting');
    console.log('✅ Real-time AI fraud detection');
    console.log('✅ Message history and analysis');
    console.log('✅ Risk scoring and warnings');
    console.log('✅ Suspicious keyword detection');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.msg || error.message);
  }
}

// Run the test
testCommunicationSystem();
