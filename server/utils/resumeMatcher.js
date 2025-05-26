// server/utils/resumeMatcher.js
const natural = require('natural'); // You may need to install this
const tokenizer = new natural.WordTokenizer();

// IT skills list for extraction
const IT_SKILLS = [
  'python', 'java', 'c++', 'c#', 'javascript', 'html', 'css', 'react', 'node.js', 'express', 'mongodb', 'sql', 'angular', 'vue', 'typescript', 'docker', 'aws', 'azure', 'git', 'linux', 'django', 'flask', 'spring', 'kotlin', 'swift', 'php', 'ruby', 'go', 'matlab', 'r', 'scala', 'firebase', 'graphql', 'rest', 'api', 'machine learning', 'deep learning', 'nlp', 'data science', 'pandas', 'numpy', 'tensorflow', 'keras', 'pytorch', 'excel', 'power bi', 'tableau', 'project management', 'agile', 'scrum', 'jira', 'sql server', 'oracle', 'postgresql', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel', 'redux', 'next.js', 'nestjs', 'selenium', 'cypress', 'testing', 'jest', 'mocha', 'chai', 'figma', 'adobe xd', 'photoshop', 'illustrator', 'ui/ux', 'design', 'restful', 'oop', 'oop concepts', 'api development', 'microservices', 'cloud', 'devops', 'ci/cd', 'unit testing', 'integration testing', 'system design', 'data structures', 'algorithms', 'networking', 'security', 'encryption', 'debugging', 'performance', 'optimization', 'mobile', 'android', 'ios', 'react native', 'flutter', 'xamarin', 'unity', 'game development', 'blockchain', 'solidity', 'ethereum', 'salesforce', 'sap', 'erp', 'crm', 'json', 'xml', 'yaml', 'bash', 'shell', 'powershell', 'unix', 'windows', 'macos', 'jenkins', 'travis', 'circleci', 'github actions', 'bitbucket', 'gitlab', 'svn', 'mercurial', 'confluence', 'notion', 'slack', 'teams', 'zoom', 'trello', 'asana', 'kanban', 'uml', 'swagger', 'postman', 'insomnia', 'api testing', 'load testing', 'performance testing', 'automation', 'manual testing', 'qa', 'quality assurance', 'support', 'helpdesk', 'it support', 'hardware', 'electronics', 'embedded', 'raspberry pi', 'arduino', 'robotics', 'mathematics', 'statistics', 'system administration', 'virtualization', 'vmware', 'hyper-v', 'kubernetes', 'openshift', 'ansible', 'chef', 'puppet', 'terraform', 'infrastructure as code', 'monitoring', 'prometheus', 'grafana', 'splunk', 'elk', 'logstash', 'kibana', 'elasticsearch', 'big data', 'hadoop', 'spark', 'hive', 'pig', 'cassandra', 'couchdb', 'redis', 'memcached', 'nosql', 'database', 'data warehouse', 'etl', 'data pipeline', 'data engineering', 'data analytics', 'business intelligence', 'ai', 'artificial intelligence', 'ml', 'dl', 'computer vision', 'opencv', 'scikit-learn', 'matplotlib', 'seaborn', 'plotly', 'd3.js', 'chart.js', 'web development', 'frontend', 'backend', 'fullstack', 'websocket', 'monolith', 'saas', 'paas', 'iaas', 'container', 'serverless', 'lambda', 'cloud functions', 'heroku', 'netlify', 'vercel', 'digitalocean', 'linode', 'vps', 'hosting', 'domain', 'ssl', 'tls', 'cybersecurity', 'pentesting', 'vulnerability', 'firewall', 'ids', 'ips', 'vpn', 'proxy', 'load balancer', 'cdn', 'akamai', 'cloudflare', 'waf', 'api gateway', 'reverse proxy', 'nginx', 'apache', 'tomcat', 'iis', 'ftp', 'sftp', 'ssh', 'scp', 'rsync', 'network', 'tcp/ip', 'udp', 'http', 'https', 'smtp', 'imap', 'pop3', 'dns', 'dhcp', 'lan', 'wan', 'wifi', 'bluetooth', 'iot', 'internet of things', 'edge computing', 'cryptocurrency', 'bitcoin', 'smart contract', 'web3', 'dapp', 'nft', 'metaverse', 'ar', 'vr', 'xr', 'unreal', 'gamedev', 'mobile development', 'ionic', 'cordova', 'pwa', 'progressive web app', 'responsive design', 'accessibility', 'a11y', 'seo', 'sem', 'analytics', 'google analytics', 'tag manager', 'ads', 'adwords', 'facebook ads', 'marketing automation', 'hubspot', 'zoho', 'mailchimp', 'sendgrid', 'twilio', 'sms', 'email', 'push notification', 'webhook', 'api integration', 'third party api', 'payment gateway', 'stripe', 'paypal', 'razorpay', 'paytm', 'upi', 'ecommerce', 'shopify', 'woocommerce', 'magento', 'prestashop', 'opencart', 'bigcommerce', 'microsoft dynamics', 'hrms', 'payroll', 'attendance', 'biometric', 'timesheet'
];

const matchSkills = (resumeText, requiredSkills) => {
  const resumeWords = tokenizer.tokenize(resumeText.toLowerCase());
  let matched = 0;
  requiredSkills.forEach(skill => {
    if (resumeWords.includes(skill.toLowerCase())) matched++;
  });

  return Math.round((matched / requiredSkills.length) * 100);
};

// Extract IT skills from resume text
function extractSkills(resumeText) {
  const text = resumeText.toLowerCase();
  return IT_SKILLS.filter(skill => text.includes(skill));
}

// Find missing required skills
function getMissingSkills(applicantSkills, requiredSkills) {
  return requiredSkills.filter(skill => !applicantSkills.includes(skill.toLowerCase()));
}

module.exports = { matchSkills, extractSkills, getMissingSkills };
