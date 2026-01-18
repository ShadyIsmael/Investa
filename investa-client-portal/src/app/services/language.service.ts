import { Injectable, signal, computed } from '@angular/core';
import { get } from 'lodash-es';

const TRANSLATIONS = {
  en: {
    // General
    all: 'All',
    stocks: 'Stocks',
    crypto: 'Crypto',
    fund: 'Fund',
    funds: 'Funds',
    stock: 'Stock',
    language: {
      toggle: 'العربية'
    },

    // Header
    header: {
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        blog: 'Blog',
        contact: 'Contact',
      },
      login: 'Login',
      loginAsInvestor: 'Login as Investor',
      loginAsOwner: 'Login as Founder',
      signup: 'Sign Up',
    },
    // Hero
    hero: {
      title_part1: 'INVESTA',
      title_part2: 'Join the community, Grow your wealth, Build your future',
      description: 'Join a vibrant network of forward-thinking investors. Discover new opportunities, share insights, and build your financial future with a platform designed for growth.',
      getStartedButton: 'Get Started',
      watchDemoButton: 'Watch Demo'
    },
    // Features
    features: {
      title: 'Advanced Features for Smarter Investing',
      subtitle: 'Leverage the power of artificial intelligence to enhance your investment strategy.',
      realTime: {
        title: 'Real-Time Analytics',
        description: 'Access lightning-fast market data and AI-driven analysis to stay ahead of trends.'
      },
      automatedTrading: {
        title: 'Automated Trading',
        description: 'Deploy intelligent bots that execute trades based on your custom strategies, 24/7.'
      },
      portfolioOptimization: {
        title: 'Portfolio Optimization',
        description: 'Our AI helps you build and maintain a diversified portfolio for optimal risk-reward balance.'
      }
    },
    // About
    about: {
      title: 'Building the Future of Investment, Together.',
      description: 'Investa is more than a platform; it’s a curated ecosystem where innovation meets capital. We unite ambitious founders, savvy investors, and skilled co-founders in a trusted environment, making it easier than ever to discover, fund, and build the next generation of groundbreaking ventures.',
      pillars: {
        discover: {
          title: 'Discover Vetted Opportunities',
          description: 'Explore a curated selection of high-potential startups and investment deals. Our rigorous screening process ensures you only see trusted opportunities, saving you time and effort.'
        },
        connect: {
          title: 'Find Your Next Partner',
          description: 'Whether you\'re an investor seeking talent or a founder looking for a co-founder, our community is your gateway to meaningful connections with industry experts and visionaries.'
        },
        grow: {
          title: 'Grow with Minimal Cost',
          description: 'Bypass the expensive intermediaries. Our platform provides the tools to connect and secure funding efficiently, empowering you to allocate more resources towards what truly matters: growth.'
        }
      }
    },
     // Services Page
    services: {
      title: 'Our Services',
      subtitle: 'A suite of powerful tools designed to give you a competitive edge in the financial markets.',
      list: {
        aiTrading: {
          title: 'AI Trading Bots',
          description: 'Automate your strategies with intelligent bots that analyze market data and execute trades with precision and speed.'
        },
        analytics: {
          title: 'Advanced Analytics',
          description: 'Gain deep market insights with our AI-powered analytics dashboard, tracking trends and identifying opportunities.'
        },
        portfolio: {
          title: 'Portfolio Management',
          description: 'Optimize your asset allocation and manage risk effectively with our smart portfolio balancing tools.'
        },
        research: {
          title: 'AI-Powered Research',
          description: 'Leverage machine learning models to get comprehensive reports and forecasts on stocks, crypto, and funds.'
        },
        security: {
          title: 'Bank-Grade Security',
          description: 'Your assets and data are protected with multi-layer security protocols, ensuring a safe investment environment.'
        },
        api: {
          title: 'Developer API',
          description: 'Integrate your own applications and build custom trading solutions with our robust and well-documented API.'
        }
      }
    },
    // Process Section
    process: {
      title: 'How It Works',
      subtitle: 'Start your journey towards intelligent investing in four simple steps.',
      step1: {
        title: 'Create Account',
        description: 'Sign up in minutes and complete our secure identity verification process.'
      },
      step2: {
        title: 'Fund Your Account',
        description: 'Securely deposit funds using various methods including bank transfer and cryptocurrency.'
      },
      step3: {
        title: 'Deploy AI',
        description: 'Choose from our pre-built AI strategies or customize your own trading bots.'
      },
      step4: {
        title: 'Watch It Grow',
        description: 'Monitor your portfolio\'s performance and watch your investments grow with our AI.'
      }
    },
    // Pricing Section
    pricing: {
      title: 'Flexible Pricing Plans',
      subtitle: 'Choose a plan that fits your investment style and goals. No hidden fees.',
      popular: 'Most Popular',
      monthly: 'month',
      starter: {
        name: 'Starter',
        description: 'For casual investors getting started with AI.',
        features: [
          '1 AI Trading Bot',
          'Basic Analytics',
          'Portfolio Tracking',
          'Email Support'
        ],
        button: 'Get Started'
      },
      pro: {
        name: 'Pro',
        description: 'For serious investors who need more power.',
        features: [
          '10 AI Trading Bots',
          'Advanced Analytics',
          'Portfolio Optimization',
          'Priority Email Support'
        ],
        button: 'Choose Pro'
      },
      enterprise: {
        name: 'Enterprise',
        description: 'For institutions and power users.',
        features: [
          'Unlimited AI Bots',
          'Full API Access',
          'Dedicated Account Manager',
          '24/7 Phone Support'
        ],
        button: 'Contact Us'
      }
    },
    // FAQ Section
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Have questions? We\'ve got answers. If you can\'t find what you\'re looking for, feel free to contact us.',
      q1: 'What is the minimum investment required?',
      a1: 'The minimum investment depends on the specific opportunity. For our managed funds, you can start with as little as $100. Direct stock and crypto investments have no minimum.',
      q2: 'How secure is my data and my funds?',
      a2: 'We use state-of-the-art, bank-grade security measures, including multi-factor authentication, cold storage for crypto assets, and end-to-end encryption for all data.',
      q3: 'Can I withdraw my money at any time?',
      a3: 'Yes, you can withdraw your funds at any time. Withdrawals are processed within 1-3 business days depending on the method.',
      q4: 'Are the AI trading bots customizable?',
      a4: 'Absolutely. While we offer pre-configured bots based on successful strategies, our Pro and Enterprise plan users can fully customize bot parameters to match their own risk tolerance and strategy.',
      q5: 'Do you offer a mobile app?',
      a5: 'Yes, our mobile app is available for both iOS and Android. It offers all the core features of the web platform, allowing you to manage your portfolio on the go.'
    },
    // CTA
    cta: {
      title: 'Ready to Elevate Your Trading?',
      subtitle: 'Join thousands of investors who are leveraging AI to build their wealth. Get started in minutes.',
      button: 'Create Your Account'
    },
    // Testimonials
    testimonials: {
      title: 'What Our Users Say',
      subtitle: 'Real stories from investors who trust Investa.',
      sarah: 'Investa has completely transformed my approach to the markets. The AI insights are incredibly accurate and have saved me countless hours of research.',
      michael: 'As a long-term investor, the portfolio optimization tool is a game-changer. It helps me stay diversified and manage risk effectively. Highly recommended!',
      jessica: 'The automated trading bots are fantastic. I can set my strategy and let the platform do the heavy lifting. My portfolio has never been healthier.'
    },
    // Blog
    blog: {
      title: 'Latest Insights',
      subtitle: 'Stay informed with our latest articles and market news.',
      readMore: 'Read More',
      post1: {
        title: 'Understanding the Impact of AI on Forex Trading',
        excerpt: 'Discover how machine learning algorithms are predicting currency fluctuations with unprecedented accuracy.'
      },
      post2: {
        title: 'Our 2024 Tech Stack: Building a Resilient Platform',
        excerpt: 'A deep dive into the infrastructure that powers Investa\'s real-time data processing and AI engines.'
      },
      post3: {
        title: 'Risk Management Strategies for Automated Trading',
        excerpt: 'Learn how to set up effective stop-losses and risk parameters for your trading bots.'
      },
       post4: {
        title: 'The Psychology of Investing: Avoiding Emotional Decisions',
        excerpt: 'Explore common cognitive biases that affect investors and learn strategies to maintain a rational approach.'
      },
      post5: {
        title: 'Beginner\'s Guide to Cryptocurrency Staking',
        excerpt: 'Understand the basics of staking, how it works, and how you can earn passive income from your crypto assets.'
      },
      post6: {
        title: 'Diversification is Key: Building a Balanced Portfolio',
        excerpt: 'A look into the importance of asset allocation and how to spread risk across different investment types.'
      },
      post7: {
        title: 'AI in Real Estate: The Next Frontier of PropTech',
        excerpt: 'How artificial intelligence is revolutionizing property valuation, management, and investment opportunities.'
      },
      post8: {
        title: 'Understanding ETFs vs. Mutual Funds',
        excerpt: 'A clear breakdown of the differences, benefits, and drawbacks of these two popular investment vehicles.'
      },
      post9: {
        title: 'The Rise of ESG Investing',
        excerpt: 'Learn why Environmental, Social, and Governance factors are becoming crucial for modern investors.'
      },
      post10: {
        title: 'From Idea to Impact: Building a Sustainable Business',
        excerpt: 'Transform your brilliant idea into a lasting enterprise. This guide walks you through the key steps, from validating your concept to achieving long-term growth and sustainability.',
        content: [
          { "type": "p", "text": "Every groundbreaking company begins with a single spark: an idea. But how do you transform that fleeting moment of inspiration into a thriving, sustainable business? The journey is a marathon, not a sprint, requiring careful planning, relentless execution, and the agility to adapt. This guide outlines the critical phases of building a business that lasts." },
          { "type": "h2", "text": "Phase 1: Validation & Foundation" },
          { "type": "p", "text": "Before you write a single line of code or invest a dollar, you must validate your idea. An idea is worthless without a market that needs it." },
          { "type": "ul", "items": [
            "<strong>Market Research:</strong> Who are your potential customers? What problems are they facing? Is your solution a 'nice-to-have' or a 'must-have'? Dive deep into competitor analysis, market size, and customer demographics.",
            "<strong>Define Your MVP:</strong> Your Minimum Viable Product isn't the final version of your dream; it's the simplest version that solves a core problem for your target audience. This allows you to test your assumptions, gather real-world feedback, and iterate quickly without wasting resources.",
            "<strong>Build a Solid Business Plan:</strong> A business plan is your roadmap. It should outline your mission, vision, value proposition, revenue model, and financial projections. This document is crucial for securing funding and keeping your team aligned."
          ]},
          { "type": "h2", "text": "Phase 2: Launch & Growth" },
          { "type": "p", "text": "With a validated idea and a solid plan, it's time to introduce your business to the world." },
          { "type": "ul", "items": [
            "<strong>Crafting a Brand Identity:</strong> Your brand is more than a logo. It's the story you tell, the values you represent, and the emotional connection you build with your customers. A strong brand builds trust and loyalty.",
            "<strong>Go-to-Market Strategy:</strong> How will you reach your customers? Your strategy could include content marketing, social media campaigns, paid advertising, or strategic partnerships. The key is to be where your audience is.",
            "<strong>Gather Feedback and Iterate:</strong> The launch is just the beginning. Actively listen to your early adopters. Use their feedback—both positive and negative—to refine your product, improve your service, and guide your development roadmap."
          ]},
          { "type": "h2", "text": "Phase 3: Scaling for Sustainability" },
          { "type": "p", "text": "Growth is exciting, but sustainable scaling is what builds an empire. This phase is about creating systems and structures that can support long-term expansion." },
          { "type": "ul", "items": [
            "<strong>Building a Team and Culture:</strong> Hire people who are not only skilled but also share your vision and values. A strong company culture is the glue that holds a scaling business together.",
            "<strong>Securing Funding:</strong> As you grow, you'll need capital to fuel expansion. Platforms like Investa connect you with investors who understand your vision and can provide the resources needed to reach the next level.",
            "<strong>Diversifying Revenue Streams:</strong> Relying on a single product or service can be risky. Explore complementary offerings, new markets, or subscription models to create a more resilient business.",
            "<strong>Embracing ESG:</strong> Modern businesses are judged on more than just profit. Integrating Environmental, Social, and Governance principles into your operations can attract talent, win customers, and build a legacy of positive impact."
          ]},
          { "type": "p", "text": "Building a sustainable business is a challenging but incredibly rewarding endeavor. By focusing on validation, strategic growth, and long-term vision, you can turn your idea into an impactful enterprise that stands the test of time." }
        ]
      }
    },
     // Blog Page
    blogPage: {
      title: 'The Investa Blog',
      subtitle: 'Your source for market insights, investment strategies, and the latest in financial technology.'
    },
    // Blog Post Page
    blogPostPage: {
      publishedBy: 'Published by',
      on: 'on',
      shareArticle: 'Share this article',
      relatedPosts: 'Related Posts'
    },
    // Contact Page
    contactPage: {
      title: "Contact Us",
      subtitle: "We'd love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.",
      details: {
        title: "Get in Touch",
        description: "Our team is available to help you with any inquiries. Here's how you can reach us:",
        addressLabel: "Address",
        addressValue: "123 Tech Lane, Future City, CA 90210",
        emailLabel: "Email",
        emailValue: "support@investa.com",
        phoneLabel: "Phone",
        phoneValue: "+1 (555) 123-4567"
      },
      form: {
        title: "Send a Message",
        nameLabel: "Full Name",
        namePlaceholder: "John Doe",
        emailLabel: "Email Address",
        emailPlaceholder: "you@example.com",
        subjectLabel: "Subject",
        subjectPlaceholder: "Regarding my investment...",
        messageLabel: "Your Message",
        messagePlaceholder: "Write your message here...",
        button: "Send Message"
      }
    },
    // Footer
    footer: {
      tagline: 'The future of intelligent investing is here. Join us to redefine your financial journey.',
      copyright: 'Investa. All Rights Reserved.',
      solutions: {
        title: 'Solutions',
        ai: 'AI Trading',
        analytics: 'Analytics',
        portfolio: 'Portfolio Management',
        api: 'API Access'
      },
      support: {
        title: 'Support',
        pricing: 'Pricing',
        docs: 'Documentation',
        guides: 'Guides',
        center: 'Support Center'
      },
      company: {
        title: 'Company',
        about: 'About Us',
        blog: 'Blog',
        careers: 'Careers',
        press: 'Press'
      },
      legal: {
        title: 'Legal',
        claim: 'Claim',
        privacy: 'Privacy',
        terms: 'Terms',
        risk: 'Risk Disclosure'
      }
    },
    // Role Select Modal
    roleSelect: {
      title: 'Choose Your Role',
      subtitle: 'Select your path to get started with Investa. Are you here to find opportunities or to create them?',
      investor: {
        title: 'Investor',
        description: 'I am looking to discover and fund promising new ventures.',
        button: 'Login as Investor'
      },
      founder: {
        title: 'Founder',
        description: 'I am seeking funding and partners to build my business.',
        button: 'Login as Founder'
      }
    },
    // Login Page
    login: {
        title: 'Welcome Back',
        subtitle: 'Sign in to continue your journey in AI investing.',
        mobileLabel: 'Mobile Number',
        mobilePlaceholder: 'Enter your mobile number',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot your password?',
        signInButton: 'Sign In',
        orContinueWith: 'Or continue with',
        notAMember: 'Not a member?',
        signUpNow: 'Sign up now'
    },
    // Signup Page
    signup: {
        title: 'Create Your Account',
        subtitle: 'Join us and start your AI investing journey.',
        mobileLabel: 'Mobile Number',
        mobilePlaceholder: 'Enter your mobile number',
        firstNameLabel: 'First Name',
        firstNamePlaceholder: 'John',
        lastNameLabel: 'Last Name',
        lastNamePlaceholder: 'Doe',
        emailLabel: 'Email Address',
        optional: 'Optional',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Create a strong password',
        confirmPasswordLabel: 'Confirm Password',
        confirmPasswordPlaceholder: 'Re-enter your password',
        passwordMismatch: 'Passwords do not match.',
        signUpButton: 'Sign Up',
        alreadyHaveAccount: 'Already have an account?',
        signIn: 'Sign in'
    },
    // Admin Nav
    adminNav: {
        panel: 'Investa Panel',
        dashboard: 'Dashboard',
        investments: 'Investments',
        communication: 'Communication',
        returnHome: 'Go Home',
        userMenu: {
            profile: 'Your Profile',
            settings: 'Settings'
        },
        logout: 'Logout'
    },
    // Admin Dashboard
    dashboard: {
        title: 'Admin Dashboard',
        investorTitle: 'Investor Dashboard',
        founderTitle: 'Founder Dashboard',
        welcome: 'Welcome, Admin!',
        description: 'This is your control center. From here you can manage users, view analytics, and configure the platform settings.',
        myProjectOverview: 'My Project Overview',
        totalInvestors: 'Total Investors',
        profileViews: 'Project Views',
        engagementScore: 'Engagement Score',
        recentActivity: 'Recent Activity',
        investorInterest: 'New Investors Over Time',
        quickActions: 'Quick Actions',
        editProject: 'Edit Project',
        viewPublicPage: 'View Public Page',
        postUpdate: 'Post an Update',
        noProject: {
          title: "You haven't submitted a project yet.",
          subtitle: "Submit your project to start tracking its funding progress and investor engagement.",
          button: "Submit Your Project"
        },
        portfolioValue: 'Portfolio Value',
        myInvestments: 'My Investments',
        watchlist: 'My Watchlist',
        investorScore: 'My Score',
        availableCredits: 'Available Credits',
        myAllocation: 'My Portfolio Allocation',
        portfolioPerformance: 'Portfolio Performance',
        featuredOpportunities: 'Featured Opportunities',
        viewAll: 'View All',
        topSectors: 'Top 5 Investment Sectors',
        totalInvestments: 'Total Investments',
        activeProjects: 'Active Projects',
        businessesEngaged: 'Businesses Engaged',
        monthlyGrowth: 'Monthly Investment Growth',
        zoomHint: 'Use mouse wheel to zoom and drag to pan.',
        sentRequestsTitle: 'Sent Engagement Requests',
        requestStatus: {
          pending: 'Pending',
          negotiating: 'Negotiating',
          partner: 'Partner',
          rejected: 'Rejected'
        },
        withdraw: 'Withdraw',
        noSentRequests: 'You have not sent any engagement requests yet.',
        withdrawModal: {
          title: 'Confirm Withdrawal',
          message: 'Are you sure you want to withdraw your engagement request for {projectName}? You will be refunded the 5 credits spent on this request.',
          cancelButton: 'Cancel',
          confirmButton: 'Confirm Withdrawal'
        },
        withdrawSuccess: {
          title: 'Request Withdrawn',
          message: 'Your engagement request for {projectName} has been successfully withdrawn.'
        },
        selectProjectTitle: 'Select a Project',
        selectProjectSubtitle: 'You have multiple projects. Choose one to view its detailed dashboard.',
        switchProject: 'Switch Project'
    },
    // Admin Investments
    investments: {
      title: 'Explore Opportunities',
      startInvestingButton: 'Submit Project',
      filterPlaceholder: 'Filter investments...',
      advancedSearch: 'Advanced Search',
      riskLevel: 'Risk Level',
      risk: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        risk: 'Risk'
      },
      fundingProgress: 'Funding Progress',
      min: 'Min',
      to: 'to',
      max: 'Max',
      showOnly: 'Show Only',
      favorites: 'Favorites',
      reset: 'Reset',
      score: 'SCORE',
      investors: 'Investors',
      share: 'Share investment',
      addToFavorites: 'Add to favorites',
      engage: 'Engage',
      noResultsTitle: 'No investments found',
      noResultsSubtitle: 'No assets match your current filter. Try a different category or search term.',
      previous: 'Previous',
      page: 'Page',
      of: 'of',
      next: 'Next',
      engageModal: {
        title: "Confirm Engagement",
        message: "Engaging with {investmentName} will cost {creditCost} credits. Are you sure you want to proceed?",
        cancelButton: "Cancel",
        proceedButton: "Proceed & Engage"
      },
      engageSuccessTitle: "Request Sent",
      engageSuccessMessage: "Your engagement request for {investmentName} has been sent. You will be notified upon acceptance."
    },
    investmentPreview: {
      backButton: "Back to Investments",
      fundingStatus: "Funding Status",
      author: "Author",
      noInvestors: "Be the first to invest!",
      investNowButton: "Invest Now",
      notFound: {
        title: "Investment Not Found",
        subtitle: "Sorry, we couldn't find the investment you were looking for."
      }
    },
    // Start Investigation
    startInvestigation: {
      title: "Submit a New Investment Opportunity",
      subtitle: "Provide the following details to begin the investigation and vetting process.",
      steps: {
        basic: "Basic Info",
        details: "Project Details",
        financials: "Financials",
        team: "Team & Legal",
        review: "Review"
      },
      basicInfo: {
        title: "Basic Information",
        projectName: "Project Name",
        projectNamePlaceholder: "e.g., Quantum Leap AI",
        tagline: "Project Tagline",
        taglinePlaceholder: "A short, catchy phrase describing your project",
        category: "Investment Category",
        categorySelect: "Select a category",
        realEstate: "Real Estate",
        technology: "Technology",
        logo: "Project Logo or Main Image",
        logoHint: "Recommended size: 400x400px, PNG or JPG",
        upload: "Upload Image"
      },
      projectDetails: {
        title: "Project Details",
        summary: "Executive Summary",
        summaryPlaceholder: "Provide a concise overview of your project, its purpose, and its potential.",
        problem: "Problem Statement",
        problemPlaceholder: "Describe the problem or need your project addresses.",
        solution: "Solution",
        solutionPlaceholder: "Explain how your project solves this problem.",
        usp: "Unique Selling Proposition (USP)",
        uspPlaceholder: "What makes your project unique and better than competitors?"
      },
      financials: {
        title: "Financial Information",
        target: "Target Funding Amount (USD)",
        targetPlaceholder: "e.g., 500000",
        minInvestment: "Minimum Investment per User (USD)",
        minInvestmentPlaceholder: "e.g., 500",
        valuation: "Pre-Money Valuation (USD)",
        valuationPlaceholder: "e.g., 2000000",
        projections: "Revenue Projections or Financials Document",
        projectionsHint: "Upload a PDF or spreadsheet with your financial model.",
        upload: "Upload Document"
      },
      teamLegal: {
        title: "Team & Legal",
        team: "Founders & Core Team Members",
        addMember: "Add Team Member",
        removeMember: "Remove",
        memberName: "Full Name",
        memberRole: "Role / Title",
        memberBio: "Short Bio & Experience",
        memberLinkedin: "LinkedIn Profile URL (Optional)",
        legalEntity: "Legal Entity Name",
        legalEntityPlaceholder: "e.g., Quantum Leap AI, Inc.",
        country: "Country of Registration",
        countryPlaceholder: "e.g., United States",
        businessPlan: "Whitepaper or Business Plan",
        businessPlanHint: "Upload your detailed project documentation (PDF).",
        upload: "Upload PDF"
      },
      review: {
        title: "Review Your Submission",
        subtitle: "Please review all the information carefully before submitting.",
        edit: "Edit"
      },
      buttons: {
        back: "Back",
        next: "Next Step",
        submit: "Submit for Investigation"
      },
      success: {
        title: "Submission Received",
        message: "Your project '{projectName}' has been submitted. Our team will begin the investigation process."
      }
    },
    // Admin Chat
    chat: {
        title: 'Chats',
        searchPlaceholder: 'Search contacts...',
        online: 'Online',
        offline: 'Offline',
        startAudioCall: 'Start Audio Call',
        startVideoCall: 'Start Video Call',
        noMessages: 'Select a conversation to start chatting.',
        removeAttachment: 'Remove attachment',
        attachFile: 'Attach file',
        messagePlaceholder: 'Type your message...',
        noConversationSelected: {
            title: 'No Conversation Selected',
            subtitle: 'Please select a contact from the list to view the conversation.'
        }
    },
    // Admin Profile
    profile: {
        title: 'Profile details',
        trustScore: 'Trust Score',
        subtitle: 'Build trust and level up your rewards! Verify your identity to maximize your score',
        tabs: {
            editProfile: 'Profile Details',
            communicationInfo: 'Communication',
            security: 'Security',
            changePassword: 'Change Password',
            notifications: 'Notifications'
        },
        picture: {
            title: 'Profile Picture',
            uploadButton: 'Upload New Picture',
            hint: 'PNG, JPG, GIF up to 10MB'
        },
        personalInfo: {
            title: 'Personal Information',
            firstName: 'First Name',
            lastName: 'Last Name',
            businessRole: 'Business Role',
            nationalId: 'National ID',
            uploadId: 'Upload National ID Copy',
            chooseFile: 'Choose File',
            noFileChosen: 'No file chosen',
            bio: 'Bio',
            linkedin: 'LinkedIn Profile',
            facebook: 'Facebook Profile'
        },
        communication: {
            title: 'Communication Information',
            personalContact: 'Personal Contact',
            email: 'Email Address',
            mobile: 'Mobile Number',
            address: 'Address',
            city: 'City',
            state: 'State',
            businessContact: 'Business Contact',
            businessAddress: 'Business Address',
            businessLocation: 'Business Location',
            searchLocation: 'Search for a location...'
        },
        password: {
            title: 'Change Password',
            current: 'Current Password',
            new: 'New Password',
            confirm: 'Confirm New Password',
            mismatch: 'New passwords do not match.'
        },
        notifications: {
            title: 'Notification Settings',
            subtitle: "Choose how you want to be notified. We'll always let you know about important changes, but you can pick what else you want to hear about.",
            opportunities: {
                title: 'New Investment Opportunities',
                description: 'Get notified when new funds or stocks that match your interests are listed.'
            },
            portfolio: {
                title: 'Portfolio Updates',
                description: "Receive weekly summaries and notifications about significant changes in your portfolio's value."
            },
            security: {
                title: 'Security Alerts',
                description: 'Get notified about new logins, password changes, and other security-related events.'
            },
            news: {
                title: 'Market News & Insights',
                description: 'Receive our newsletter with the latest market analysis and insights from our experts.'
            }
        },
        verified: 'Verified',
        pending: 'Pending Verification',
        saveButton: 'Save Changes'
    },
     // Admin Notifications
    notifications: {
        title: 'Notifications',
        all: 'All',
        unread: 'Unread',
        delete: 'Delete notification',
        noNotifications: {
            title: 'No notifications',
            allCaughtUp: "You're all caught up!",
            subtitle: 'Your notifications will appear here.'
        }
    }
  },
  ar: {
    // General
    all: 'الكل',
    stocks: 'أسهم',
    crypto: 'عملات رقمية',
    fund: 'صندوق',
    funds: 'صناديق',
    stock: 'سهم',
    language: {
      toggle: 'English'
    },
    
    // Header
    header: {
      nav: {
        home: 'الرئيسية',
        about: 'عنا',
        services: 'الخدمات',
        blog: 'المدونة',
        contact: 'اتصل بنا',
      },
      login: 'تسجيل الدخول',
      loginAsInvestor: 'تسجيل الدخول كمستثمر',
      loginAsOwner: 'تسجيل الدخول كمؤسس',
      signup: 'إنشاء حساب',
    },
    // Hero
    hero: {
      title_part1: 'إنفستا',
      title_part2: 'انضم للمجتمع، نمّ ثروتك، ابنِ مستقبلك',
      description: 'انضم إلى شبكة نابضة بالحياة من المستثمرين ذوي التفكير المستقبلي. اكتشف فرصًا جديدة، وشارك الرؤى، وابنِ مستقبلك المالي من خلال منصة مصممة للنمو.',
      getStartedButton: 'ابدأ الآن',
      watchDemoButton: 'شاهد العرض'
    },
     // Features
    features: {
      title: 'ميزات متقدمة لاستثمار أذكى',
      subtitle: 'استفد من قوة الذكاء الاصطناعي لتعزيز استراتيجيتك الاستثمارية.',
      realTime: {
        title: 'تحليلات في الوقت الفعلي',
        description: 'احصل على بيانات السوق السريعة وتحليلات الذكاء الاصطناعي لتكون دائمًا في الطليعة.'
      },
      automatedTrading: {
        title: 'تداول آلي',
        description: 'شغّل روبوتات ذكية تنفذ الصفقات بناءً على استراتيجياتك المخصصة، على مدار الساعة.'
      },
      portfolioOptimization: {
        title: 'تحسين المحفظة',
        description: 'يساعدك الذكاء الاصطناعي على بناء محفظة متنوعة والحفاظ عليها لتحقيق توازن مثالي بين المخاطر والعوائد.'
      }
    },
    // About
    about: {
      title: 'نبني مستقبل الاستثمار، معًا.',
      description: 'إنفستا هي أكثر من مجرد منصة؛ إنها نظام بيئي منسق حيث يلتقي الابتكار برأس المال. نحن نوحد المؤسسين الطموحين والمستثمرين الأذكياء والمؤسسين المشاركين المهرة في بيئة موثوقة، مما يجعل اكتشاف وتمويل وبناء الجيل القادم من المشاريع الرائدة أسهل من أي وقت مضى.',
      pillars: {
        discover: {
          title: 'اكتشف فرصًا موثوقة',
          description: 'استكشف مجموعة منسقة من الشركات الناشئة والصفقات الاستثمارية ذات الإمكانات العالية. تضمن عملية الفحص الصارمة لدينا أنك ترى فقط الفرص الموثوقة، مما يوفر لك الوقت والجهد.'
        },
        connect: {
          title: 'اعثر على شريكك التالي',
          description: 'سواء كنت مستثمرًا يبحث عن موهبة أو مؤسسًا يبحث عن شريك، فإن مجتمعنا هو بوابتك لإقامة علاقات هادفة مع خبراء الصناعة وأصحاب الرؤى.'
        },
        grow: {
          title: 'انطلق بأقل التكاليف',
          description: 'تجاوز الوسطاء المكلفين. توفر منصتنا الأدوات اللازمة للتواصل وتأمين التمويل بكفاءة، مما يمكّنك من تخصيص المزيد من الموارد لما يهم حقًا: النمو.'
        }
      }
    },
     // Services Page
    services: {
      title: 'خدماتنا',
      subtitle: 'مجموعة من الأدوات القوية المصممة لمنحك ميزة تنافسية في الأسواق المالية.',
      list: {
        aiTrading: {
          title: 'روبوتات التداول بالذكاء الاصطناعي',
          description: 'أتمتة استراتيجياتك باستخدام روبوتات ذكية تحلل بيانات السوق وتنفذ الصفقات بدقة وسرعة.'
        },
        analytics: {
          title: 'تحليلات متقدمة',
          description: 'احصل على رؤى عميقة للسوق من خلال لوحة تحكم التحليلات المدعومة بالذكاء الاصطناعي، وتتبع الاتجاهات وحدد الفرص.'
        },
        portfolio: {
          title: 'إدارة المحافظ',
          description: 'قم بتحسين توزيع أصولك وإدارة المخاطر بفعالية باستخدام أدوات موازنة المحفظة الذكية الخاصة بنا.'
        },
        research: {
          title: 'أبحاث مدعومة بالذكاء الاصطناعي',
          description: 'استفد من نماذج التعلم الآلي للحصول على تقارير وتوقعات شاملة حول الأسهم والعملات المشفرة والصناديق.'
        },
        security: {
          title: 'أمان من الدرجة المصرفية',
          description: 'أصولك وبياناتك محمية ببروتوكولات أمان متعددة الطبقات، مما يضمن بيئة استثمارية آمنة.'
        },
        api: {
          title: 'واجهة برمجة التطبيقات للمطورين',
          description: 'ادمج تطبيقاتك الخاصة وابنِ حلول تداول مخصصة باستخدام واجهة برمجة التطبيقات القوية والموثقة جيدًا.'
        }
      }
    },
     // Process Section
    process: {
      title: 'كيف نعمل',
      subtitle: 'ابدأ رحلتك نحو الاستثمار الذكي في أربع خطوات بسيطة.',
      step1: {
        title: 'إنشاء حساب',
        description: 'سجل في دقائق وأكمل عملية التحقق من الهوية الآمنة لدينا.'
      },
      step2: {
        title: 'تمويل حسابك',
        description: 'قم بإيداع الأموال بأمان باستخدام طرق مختلفة بما في ذلك التحويل المصرفي والعملات المشفرة.'
      },
      step3: {
        title: 'نشر الذكاء الاصطناعي',
        description: 'اختر من استراتيجيات الذكاء الاصطناعي المعدة مسبقًا أو قم بتخصيص روبوتات التداول الخاصة بك.'
      },
      step4: {
        title: 'شاهدها تنمو',
        description: 'راقب أداء محفظتك وشاهد استثماراتك تنمو مع ذكائنا الاصطناعي.'
      }
    },
    // Pricing Section
    pricing: {
      title: 'خطط أسعار مرنة',
      subtitle: 'اختر خطة تناسب أسلوبك وأهدافك الاستثمارية. لا توجد رسوم خفية.',
      popular: 'الأكثر شيوعًا',
      monthly: 'شهريًا',
      starter: {
        name: 'المبتدئ',
        description: 'للمستثمرين العاديين الذين يبدأون في استخدام الذكاء الاصطناعي.',
        features: [
          '1 روبوت تداول ذكاء اصطناعي',
          'تحليلات أساسية',
          'تتبع المحفظة',
          'دعم عبر البريد الإلكتروني'
        ],
        button: 'ابدأ الآن'
      },
      pro: {
        name: 'المحترف',
        description: 'للمستثمرين الجادين الذين يحتاجون إلى مزيد من القوة.',
        features: [
          '10 روبوتات تداول ذكاء اصطناعي',
          'تحليلات متقدمة',
          'تحسين المحفظة',
          'دعم ذو أولوية عبر البريد الإلكتروني'
        ],
        button: 'اختر المحترف'
      },
      enterprise: {
        name: 'المؤسسات',
        description: 'للمؤسسات والمستخدمين المتقدمين.',
        features: [
          'روبوتات ذكاء اصطناعي غير محدودة',
          'وصول كامل لواجهة برمجة التطبيقات',
          'مدير حساب مخصص',
          'دعم هاتفي على مدار الساعة'
        ],
        button: 'اتصل بنا'
      }
    },
     // FAQ Section
    faq: {
      title: 'الأسئلة الشائعة',
      subtitle: 'لديك أسئلة؟ لدينا إجابات. إذا لم تتمكن من العثور على ما تبحث عنه، فلا تتردد في الاتصال بنا.',
      q1: 'ما هو الحد الأدنى للاستثمار المطلوب؟',
      a1: 'يعتمد الحد الأدنى للاستثمار على الفرصة المحددة. بالنسبة لصناديقنا المدارة، يمكنك البدء بمبلغ بسيط يصل إلى 100 دولار. لا يوجد حد أدنى للاستثمارات المباشرة في الأسهم والعملات المشفرة.',
      q2: 'ما مدى أمان بياناتي وأموالي؟',
      a2: 'نحن نستخدم إجراءات أمنية حديثة من الدرجة المصرفية، بما في ذلك المصادقة متعددة العوامل، والتخزين البارد لأصول العملات المشفرة، والتشفير من طرف إلى طرف لجميع البيانات.',
      q3: 'هل يمكنني سحب أموالي في أي وقت؟',
      a3: 'نعم، يمكنك سحب أموالك في أي وقت. تتم معالجة عمليات السحب في غضون 1-3 أيام عمل حسب الطريقة.',
      q4: 'هل روبوتات التداول بالذكاء الاصطناعي قابلة للتخصيص؟',
      a4: 'بالتأكيد. بينما نقدم روبوتات مهيأة مسبقًا بناءً على استراتيجيات ناجحة، يمكن لمستخدمي خطط المحترفين والمؤسسات تخصيص معايير الروبوت بالكامل لتتناسب مع قدرتهم على تحمل المخاطر واستراتيجيتهم الخاصة.',
      q5: 'هل تقدمون تطبيقًا للهاتف المحمول؟',
      a5: 'نعم، تطبيقنا للهاتف المحمول متاح لكل من iOS و Android. وهو يقدم جميع الميزات الأساسية للمنصة على الويب، مما يتيح لك إدارة محفظتك أثناء التنقل.'
    },
    // CTA
    cta: {
      title: 'هل أنت مستعد للارتقاء بتداولاتك؟',
      subtitle: 'انضم إلى آلاف المستثمرين الذين يستفيدون من الذكاء الاصطناعي لبناء ثرواتهم. ابدأ في دقائق.',
      button: 'أنشئ حسابك'
    },
     // Testimonials
    testimonials: {
      title: 'ماذا يقول مستخدمونا',
      subtitle: 'قصص حقيقية من مستثمرين يثقون في إنفستا.',
      sarah: 'لقد غيرت إنفستا نهجي في التعامل مع الأسواق تمامًا. رؤى الذكاء الاصطناعي دقيقة بشكل لا يصدق ووفرت لي ساعات لا تحصى من البحث.',
      michael: 'كمستثمر طويل الأجل، أداة تحسين المحفظة هي تغيير جذري. تساعدني على البقاء متنوعًا وإدارة المخاطر بفعالية. موصى به بشدة!',
      jessica: 'روبوتات التداول الآلي رائعة. يمكنني تحديد استراتيجيتي وترك المنصة تقوم بالعمل الشاق. لم تكن محفظتي أفضل حالًا من أي وقت مضى.'
    },
     // Blog
    blog: {
      title: 'أحدث الرؤى',
      subtitle: 'ابق على اطلاع بآخر مقالاتنا وأخبار السوق.',
      readMore: 'اقرأ المزيد',
      post1: {
        title: 'فهم تأثير الذكاء الاصطناعي على تداول الفوركس',
        excerpt: 'اكتشف كيف تتنبأ خوارزميات التعلم الآلي بتقلبات العملات بدقة غير مسبوقة.'
      },
      post2: {
        title: 'مجموعتنا التقنية لعام 2024: بناء منصة مرنة',
        excerpt: 'نظرة عميقة على البنية التحتية التي تدعم معالجة البيانات في الوقت الفعلي ومحركات الذكاء الاصطناعي في إنفستا.'
      },
      post3: {
        title: 'استراتيجيات إدارة المخاطر للتداول الآلي',
        excerpt: 'تعلم كيفية إعداد أوامر وقف الخسارة الفعالة ومعايير المخاطر لروبوتات التداول الخاصة بك.'
      },
      post4: {
        title: 'سيكولوجية الاستثمار: تجنب القرارات العاطفية',
        excerpt: 'استكشف التحيزات المعرفية الشائعة التي تؤثر على المستثمرين وتعلم استراتيجيات للحفاظ على نهج عقلاني.'
      },
      post5: {
        title: 'دليل المبتدئين لتخزين العملات المشفرة',
        excerpt: 'افهم أساسيات التخزين، وكيف يعمل، وكيف يمكنك كسب دخل سلبي من أصولك المشفرة.'
      },
      post6: {
        title: 'التنويع هو المفتاح: بناء محفظة متوازنة',
        excerpt: 'نظرة على أهمية توزيع الأصول وكيفية توزيع المخاطر عبر أنواع الاستثمار المختلفة.'
      },
      post7: {
        title: 'الذكاء الاصطناعي في العقارات: الحدود التالية للتكنولوجيا العقارية',
        excerpt: 'كيف يُحدث الذكاء الاصطناعي ثورة في تقييم الممتلكات وإدارتها وفرص الاستثمار.'
      },
      post8: {
        title: 'فهم صناديق المؤشرات المتداولة مقابل صناديق الاستثمار المشتركة',
        excerpt: 'تحليل واضح للاختلافات والفوائد والعيوب لهذين النوعين من أدوات الاستثمار الشائعة.'
      },
      post9: {
        title: 'صعود الاستثمار البيئي والاجتماعي والحوكمي',
        excerpt: 'تعرف على سبب أهمية العوامل البيئية والاجتماعية والحوكمية للمستثمرين المعاصرين.'
      },
      post10: {
        title: 'من فكرة إلى تأثير: بناء عمل تجاري مستدام',
        excerpt: 'حوّل فكرتك الرائعة إلى مشروع دائم. يرشدك هذا الدليل عبر الخطوات الرئيسية، بدءًا من التحقق من صحة مفهومك وحتى تحقيق النمو والاستدامة على المدى الطويل.',
        content: [
          { "type": "p", "text": "تبدأ كل شركة رائدة بشرارة واحدة: فكرة. ولكن كيف تحول تلك اللحظة العابرة من الإلهام إلى عمل تجاري مزدهر ومستدام؟ الرحلة ماراثون وليست سباقًا سريعًا، وتتطلب تخطيطًا دقيقًا وتنفيذًا لا هوادة فيه ومرونة في التكيف. يوضح هذا الدليل المراحل الحاسمة لبناء عمل يدوم." },
          { "type": "h2", "text": "المرحلة الأولى: التحقق والأساس" },
          { "type": "p", "text": "قبل كتابة سطر واحد من التعليمات البرمجية أو استثمار دولار واحد، يجب عليك التحقق من صحة فكرتك. فالفكرة لا قيمة لها بدون سوق يحتاجها." },
          { "type": "ul", "items": [
            "<strong>أبحاث السوق:</strong> من هم عملاؤك المحتملون؟ ما هي المشاكل التي يواجهونها؟ هل حلك 'من الجيد امتلاكه' أم 'لا بد من امتلاكه'؟ تعمق في تحليل المنافسين وحجم السوق والتركيبة السكانية للعملاء.",
            "<strong>حدد منتجك الأدنى القابل للتطبيق (MVP):</strong> إن منتجك الأدنى القابل للتطبيق ليس هو النسخة النهائية من حلمك؛ إنه أبسط نسخة تحل مشكلة أساسية لجمهورك المستهدف. يتيح لك ذلك اختبار افتراضاتك وجمع التعليقات الواقعية والتكرار بسرعة دون إهدار الموارد.",
            "<strong>بناء خطة عمل متينة:</strong> خطة العمل هي خارطة طريقك. يجب أن تحدد مهمتك ورؤيتك وعرض القيمة ونموذج الإيرادات والتوقعات المالية. هذه الوثيقة حاسمة لتأمين التمويل والحفاظ على توافق فريقك."
          ]},
          { "type": "h2", "text": "المرحلة الثانية: الإطلاق والنمو" },
          { "type": "p", "text": "بوجود فكرة تم التحقق منها وخطة قوية، حان الوقت لتقديم عملك إلى العالم." },
          { "type": "ul", "items": [
            "<strong>صياغة هوية العلامة التجارية:</strong> علامتك التجارية أكثر من مجرد شعار. إنها القصة التي ترويها، والقيم التي تمثلها، والصلة العاطفية التي تبنيها مع عملائك. العلامة التجارية القوية تبني الثقة والولاء.",
            "<strong>استراتيجية الذهاب إلى السوق:</strong> كيف ستصل إلى عملائك؟ يمكن أن تشمل استراتيجيتك تسويق المحتوى، وحملات وسائل التواصل الاجتماعي، والإعلانات المدفوعة، أو الشراكات الاستراتيجية. المفتاح هو أن تكون حيث يتواجد جمهورك.",
            "<strong>جمع الملاحظات والتكرار:</strong> الإطلاق هو مجرد البداية. استمع بفاعلية إلى المتبنين الأوائل. استخدم ملاحظاتهم - الإيجابية والسلبية - لتحسين منتجك وتحسين خدمتك وتوجيه خارطة طريق التطوير الخاصة بك."
          ]},
          { "type": "h2", "text": "المرحلة الثالثة: التوسع من أجل الاستدامة" },
          { "type": "p", "text": "النمو مثير، لكن التوسع المستدام هو ما يبني إمبراطورية. تدور هذه المرحلة حول إنشاء أنظمة وهياكل يمكنها دعم التوسع على المدى الطويل." },
          { "type": "ul", "items": [
            "<strong>بناء فريق وثقافة:</strong> وظف أشخاصًا ليسوا مهرة فحسب، بل يشاركونك أيضًا رؤيتك وقيمك. ثقافة الشركة القوية هي الغراء الذي يجمع بين الأعمال المتنامية.",
            "<strong>تأمين التمويل:</strong> مع نموك، ستحتاج إلى رأس مال لتغذية التوسع. تربطك منصات مثل إنفستا بالمستثمرين الذين يفهمون رؤيتك ويمكنهم توفير الموارد اللازمة للوصول إلى المستوى التالي.",
            "<strong>تنويع مصادر الإيرادات:</strong> قد يكون الاعتماد على منتج أو خدمة واحدة محفوفًا بالمخاطر. استكشف العروض التكميلية أو الأسواق الجديدة أو نماذج الاشتراك لإنشاء عمل أكثر مرونة.",
            "<strong>تبني المعايير البيئية والاجتماعية والحوكمة:</strong> يتم الحكم على الشركات الحديثة بأكثر من مجرد الربح. يمكن أن يؤدي دمج المبادئ البيئية والاجتماعية والحوكمة في عملياتك إلى جذب المواهب وكسب العملاء وبناء إرث من التأثير الإيجابي."
          ]},
          { "type": "p", "text": "إن بناء عمل مستدام هو مسعى صعب ولكنه مجزٍ بشكل لا يصدق. من خلال التركيز على التحقق والنمو الاستراتيجي والرؤية طويلة المدى، يمكنك تحويل فكرتك إلى مشروع مؤثر يصمد أمام اختبار الزمن." }
        ]
      }
    },
    // Blog Page
    blogPage: {
      title: 'مدونة إنفستا',
      subtitle: 'مصدرك لرؤى السوق، واستراتيجيات الاستثمار، وأحدث ما في التكنولوجيا المالية.'
    },
    // Blog Post Page
    blogPostPage: {
      publishedBy: 'نشر بواسطة',
      on: 'في',
      shareArticle: 'شارك هذا المقال',
      relatedPosts: 'مقالات ذات صلة'
    },
    // Contact Page
    contactPage: {
      title: "اتصل بنا",
      subtitle: "يسعدنا أن نسمع منك. سواء كان لديك سؤال حول الميزات أو الأسعار أو أي شيء آخر، فإن فريقنا مستعد للإجابة على جميع أسئلتك.",
      details: {
        title: "تواصل معنا",
        description: "فريقنا متاح لمساعدتك في أي استفسارات. إليك كيف يمكنك الوصول إلينا:",
        addressLabel: "العنوان",
        addressValue: "123 شارع التكنولوجيا، مدينة المستقبل، كاليفورنيا 90210",
        emailLabel: "البريد الإلكتروني",
        emailValue: "support@investa.com",
        phoneLabel: "الهاتف",
        phoneValue: "+1 (555) 123-4567"
      },
      form: {
        title: "أرسل رسالة",
        nameLabel: "الاسم الكامل",
        namePlaceholder: "جون دو",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "you@example.com",
        subjectLabel: "الموضوع",
        subjectPlaceholder: "بخصوص استثماري...",
        messageLabel: "رسالتك",
        messagePlaceholder: "اكتب رسالتك هنا...",
        button: "إرسال الرسالة"
      }
    },
    // Footer
    footer: {
      tagline: 'مستقبل الاستثمار الذكي هنا. انضم إلينا لإعادة تعريف رحلتك المالية.',
      copyright: 'إنفستا. جميع الحقوق محفوظة.',
      solutions: {
        title: 'الحلول',
        ai: 'التداول بالذكاء الاصطناعي',
        analytics: 'التحليلات',
        portfolio: 'إدارة المحافظ',
        api: 'واجهة برمجة التطبيقات'
      },
      support: {
        title: 'الدعم',
        pricing: 'الأسعار',
        docs: 'التوثيق',
        guides: 'الأدلة',
        center: 'مركز الدعم'
      },
      company: {
        title: 'الشركة',
        about: 'من نحن',
        blog: 'المدونة',
        careers: 'الوظائف',
        press: 'الصحافة'
      },
      legal: {
        title: 'قانوني',
        claim: 'مطالبة',
        privacy: 'الخصوصية',
        terms: 'الشروط',
        risk: 'إفصاح المخاطر'
      }
    },
    // Role Select Modal
    roleSelect: {
      title: 'اختر دورك',
      subtitle: 'حدد مسارك لتبدأ مع إنفستا. هل أنت هنا للعثور على الفرص أم لصنعها؟',
      investor: {
        title: 'مستثمر',
        description: 'أبحث عن اكتشاف وتمويل المشاريع الواعدة الجديدة.',
        button: 'تسجيل الدخول كمستثمر'
      },
      founder: {
        title: 'مؤسس',
        description: 'أسعى للحصول على تمويل وشركاء لبناء عملي.',
        button: 'تسجيل الدخول كمؤسس'
      }
    },
    // Login Page
    login: {
        title: 'مرحبًا بعودتك',
        subtitle: 'سجل الدخول لمواصلة رحلتك في الاستثمار بالذكاء الاصطناعي.',
        mobileLabel: 'رقم الجوال',
        mobilePlaceholder: 'أدخل رقم جوالك',
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: 'أدخل كلمة المرور',
        rememberMe: 'تذكرني',
        forgotPassword: 'هل نسيت كلمة المرور؟',
        signInButton: 'تسجيل الدخول',
        orContinueWith: 'أو المتابعة باستخدام',
        notAMember: 'لست عضوا؟',
        signUpNow: 'سجل الآن'
    },
    // Signup Page
    signup: {
        title: 'أنشئ حسابك',
        subtitle: 'انضم إلينا وابدأ رحلتك في الاستثمار بالذكاء الاصطناعي.',
        mobileLabel: 'رقم الجوال',
        mobilePlaceholder: 'أدخل رقم جوالك',
        firstNameLabel: 'الاسم الأول',
        firstNamePlaceholder: 'جون',
        lastNameLabel: 'الاسم الأخير',
        lastNamePlaceholder: 'دو',
        emailLabel: 'البريد الإلكتروني',
        optional: 'اختياري',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: 'أنشئ كلمة مرور قوية',
        confirmPasswordLabel: 'تأكيد كلمة المرور',
        confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
        passwordMismatch: 'كلمتا المرور غير متطابقتين.',
        signUpButton: 'إنشاء حساب',
        alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
        signIn: 'تسجيل الدخول'
    },
     // Admin Nav
    adminNav: {
        panel: 'لوحة تحكم إنفستا',
        dashboard: 'لوحة التحكم',
        investments: 'الاستثمارات',
        communication: 'التواصل',
        returnHome: 'الذهاب للرئيسية',
        userMenu: {
            profile: 'ملفك الشخصي',
            settings: 'الإعدادات'
        },
        logout: 'تسجيل الخروج'
    },
    // Admin Dashboard
    dashboard: {
        title: 'لوحة تحكم المشرف',
        investorTitle: 'لوحة تحكم المستثمر',
        founderTitle: 'لوحة تحكم المؤسس',
        welcome: 'أهلاً بك أيها المشرف!',
        description: 'هذا هو مركز التحكم الخاص بك. من هنا يمكنك إدارة المستخدمين وعرض التحليلات وتكوين إعدادات المنصة.',
        myProjectOverview: 'نظرة عامة على مشروعي',
        totalInvestors: 'إجمالي المستثمرين',
        profileViews: 'مشاهدات المشروع',
        engagementScore: 'درجة التفاعل',
        recentActivity: 'النشاط الأخير',
        investorInterest: 'المستثمرون الجدد مع مرور الوقت',
        quickActions: 'إجراءات سريعة',
        editProject: 'تعديل المشروع',
        viewPublicPage: 'عرض الصفحة العامة',
        postUpdate: 'نشر تحديث',
        noProject: {
          title: 'لم تقم بتقديم مشروع بعد.',
          subtitle: 'قدم مشروعك لبدء تتبع تقدم تمويله وتفاعل المستثمرين.',
          button: 'قدم مشروعك'
        },
        portfolioValue: 'قيمة المحفظة',
        myInvestments: 'استثماراتي',
        watchlist: 'قائمة المراقبة',
        investorScore: 'تقيimi',
        availableCredits: 'الأرصدة المتاحة',
        myAllocation: 'توزيع محفظتي',
        portfolioPerformance: 'أداء المحفظة',
        featuredOpportunities: 'فرص مميزة',
        viewAll: 'عرض الكل',
        topSectors: 'أفضل 5 قطاعات استثمارية',
        totalInvestments: 'إجمالي الاستثمارات',
        activeProjects: 'المشاريع النشطة',
        businessesEngaged: 'الشركات المشاركة',
        monthlyGrowth: 'نمو الاستثمار الشهري',
        zoomHint: 'استخدم عجلة الماوس للتكبير والسحب للتحريك.',
        sentRequestsTitle: 'طلبات التواصل المرسلة',
        requestStatus: {
          pending: 'قيد الانتظار',
          negotiating: 'قيد التفاوض',
          partner: 'شريك',
          rejected: 'مرفوض'
        },
        withdraw: 'سحب',
        noSentRequests: 'لم تقم بإرسال أي طلبات تواصل بعد.',
        withdrawModal: {
          title: 'تأكيد السحب',
          message: 'هل أنت متأكد من أنك تريد سحب طلب التواصل الخاص بك لمشروع {projectName}؟ سيتم استرداد الـ 5 أرصدة التي تم إنفاقها على هذا الطلب.',
          cancelButton: 'إلغاء',
          confirmButton: 'تأكيد السحب'
        },
        withdrawSuccess: {
          title: 'تم سحب الطلب',
          message: 'تم سحب طلب التواصل الخاص بك لمشروع {projectName} بنجاح.'
        },
        selectProjectTitle: 'اختر مشروعًا',
        selectProjectSubtitle: 'لديك عدة مشاريع. اختر واحدًا لعرض لوحة التحكم التفصيلية الخاصة به.',
        switchProject: 'تبديل المشروع'
    },
     // Admin Investments
    investments: {
      title: 'استكشف الفرص',
      startInvestingButton: 'قدم مشروعك',
      filterPlaceholder: 'تصفية الاستثمارات...',
      advancedSearch: 'بحث متقدم',
      riskLevel: 'مستوى المخاطرة',
      risk: {
        low: 'منخفض',
        medium: 'متوسط',
        high: 'مرتفع',
        risk: 'مخاطرة'
      },
      fundingProgress: 'تقدم التمويل',
      min: 'الحد الأدنى',
      to: 'إلى',
      max: 'الحد الأقصى',
      showOnly: 'عرض فقط',
      favorites: 'المفضلة',
      reset: 'إعادة تعيين',
      score: 'التقييم',
      investors: 'المستثمرون',
      share: 'مشاركة الاستثمار',
      addToFavorites: 'إضافة إلى المفضلة',
      engage: 'تفاعل',
      noResultsTitle: 'لم يتم العثور على استثمارات',
      noResultsSubtitle: 'لا توجد أصول تطابق الفلتر الحالي. جرب فئة مختلفة أو مصطلح بحث آخر.',
      previous: 'السابق',
      page: 'صفحة',
      of: 'من',
      next: 'التالي',
      engageModal: {
        title: "تأكيد التفاعل",
        message: "التفاعل مع {investmentName} سيكلفك {creditCost} رصيدًا. هل أنت متأكد أنك تريد المتابعة؟",
        cancelButton: "إلغاء",
        proceedButton: "متابعة والتفاعل"
      },
      engageSuccessTitle: "تم إرسال الطلب",
      engageSuccessMessage: "تم إرسال طلب التفاعل الخاص بك بخصوص {investmentName}. سيتم إعلامك عند القبول."
    },
    investmentPreview: {
      backButton: "العودة إلى الاستثمارات",
      fundingStatus: "حالة التمويل",
      author: "المؤلف",
      noInvestors: "كن أول من يستثمر!",
      investNowButton: "استثمر الآن",
      notFound: {
        title: "لم يتم العثور على الاستثمار",
        subtitle: "عذرًا، لم نتمكن من العثور على الاستثمار الذي تبحث عنه."
      }
    },
    // Start Investigation
    startInvestigation: {
      title: "تقديم فرصة استثمارية جديدة",
      subtitle: "قدم التفاصيل التالية لبدء عملية التحقيق والفحص.",
      steps: {
        basic: "المعلومات الأساسية",
        details: "تفاصيل المشروع",
        financials: "البيانات المالية",
        team: "الفريق والشؤون القانونية",
        review: "مراجعة"
      },
      basicInfo: {
        title: "المعلومات الأساسية",
        projectName: "اسم المشروع",
        projectNamePlaceholder: "مثال: Quantum Leap AI",
        tagline: "شعار المشروع",
        taglinePlaceholder: "عبارة قصيرة وجذابة تصف مشروعك",
        category: "فئة الاستثمار",
        categorySelect: "اختر فئة",
        realEstate: "عقارات",
        technology: "تكنولوجيا",
        logo: "شعار المشروع أو الصورة الرئيسية",
        logoHint: "الحجم الموصى به: 400x400 بكسل، PNG أو JPG",
        upload: "تحميل صورة"
      },
      projectDetails: {
        title: "تفاصيل المشروع",
        summary: "ملخص تنفيذي",
        summaryPlaceholder: "قدم نظرة عامة موجزة عن مشروعك والغرض منه وإمكانياته.",
        problem: "بيان المشكلة",
        problemPlaceholder: "صف المشكلة أو الحاجة التي يعالجها مشروعك.",
        solution: "الحل",
        solutionPlaceholder: "اشرح كيف يحل مشروعك هذه المشكلة.",
        usp: "عرض البيع الفريد (USP)",
        uspPlaceholder: "ما الذي يجعل مشروعك فريدًا وأفضل من المنافسين؟"
      },
      financials: {
        title: "المعلومات المالية",
        target: "مبلغ التمويل المستهدف (بالدولار الأمريكي)",
        targetPlaceholder: "مثال: 500000",
        minInvestment: "الحد الأدنى للاستثمار لكل مستخدم (بالدولار الأمريكي)",
        minInvestmentPlaceholder: "مثال: 500",
        valuation: "التقييم قبل التمويل (بالدولار الأمريكي)",
        valuationPlaceholder: "مثال: 2000000",
        projections: "توقعات الإيرادات أو المستند المالي",
        projectionsHint: "قم بتحميل ملف PDF أو جدول بيانات يحتوي على نموذجك المالي.",
        upload: "تحميل مستند"
      },
      teamLegal: {
        title: "الفريق والشؤون القانونية",
        team: "المؤسسون وأعضاء الفريق الأساسيون",
        addMember: "إضافة عضو فريق",
        removeMember: "إزالة",
        memberName: "الاسم الكامل",
        memberRole: "الدور / المنصب",
        memberBio: "سيرة ذاتية قصيرة وخبرة",
        memberLinkedin: "رابط ملف لينكدإن (اختياري)",
        legalEntity: "اسم الكيان القانوني",
        legalEntityPlaceholder: "مثال: Quantum Leap AI, Inc.",
        country: "بلد التسجيل",
        countryPlaceholder: "مثال: الولايات المتحدة",
        businessPlan: "ورقة عمل أو خطة عمل",
        businessPlanHint: "قم بتحميل وثائق مشروعك التفصيلية (PDF).",
        upload: "تحميل PDF"
      },
      review: {
        title: "مراجعة طلبك",
        subtitle: "يرجى مراجعة جميع المعلومات بعناية قبل الإرسال.",
        edit: "تعديل"
      },
      buttons: {
        back: "رجوع",
        next: "الخطوة التالية",
        submit: "إرسال للتحقيق"
      },
      success: {
        title: "تم استلام الطلب",
        message: "تم تقديم مشروعك '{projectName}'. سيبدأ فريقنا عملية التحقيق."
      }
    },
    // Admin Chat
    chat: {
        title: 'المحادثات',
        searchPlaceholder: 'ابحث عن جهات اتصال...',
        online: 'متصل',
        offline: 'غير متصل',
        startAudioCall: 'بدء مكالمة صوتية',
        startVideoCall: 'بدء مكالمة فيديو',
        noMessages: 'حدد محادثة لبدء الدردشة.',
        removeAttachment: 'إزالة المرفق',
        attachFile: 'إرفاق ملف',
        messagePlaceholder: 'اكتب رسالتك...',
        noConversationSelected: {
            title: 'لم يتم تحديد محادثة',
            subtitle: 'يرجى تحديد جهة اتصال من القائمة لعرض المحادثة.'
        }
    },
    // Admin Profile
    profile: {
        title: 'تفاصيل الملف الشخصي',
        trustScore: 'درجة الثقة',
        subtitle: 'ابنِ الثقة وارفع مستوى مكافآتك! تحقق من هويتك لزيادة درجاتك إلى أقصى حد',
        tabs: {
            editProfile: 'تفاصيل الملف الشخصي',
            communicationInfo: 'معلومات الاتصال',
            security: 'الأمان',
            changePassword: 'تغيير كلمة المرور',
            notifications: 'الإشعارات'
        },
        picture: {
            title: 'الصورة الشخصية',
            uploadButton: 'تحميل صورة جديدة',
            hint: 'PNG, JPG, GIF بحجم يصل إلى 10 ميجابايت'
        },
        personalInfo: {
            title: 'المعلومات الشخصية',
            firstName: 'الاسم الأول',
            lastName: 'الاسم الأخير',
            businessRole: 'الدور الوظيفي',
            nationalId: 'الهوية الوطنية',
            uploadId: 'تحميل نسخة من الهوية الوطنية',
            chooseFile: 'اختر ملفًا',
            noFileChosen: 'لم يتم اختيار ملف',
            bio: 'نبذة تعريفية',
            linkedin: 'ملف لينكدإن',
            facebook: 'ملف فيسبوك'
        },
        communication: {
            title: 'معلومات الاتصال',
            personalContact: 'الاتصال الشخصي',
            email: 'البريد الإلكتروني',
            mobile: 'رقم الجوال',
            address: 'العنوان',
            city: 'المدينة',
            state: 'المنطقة',
            businessContact: 'الاتصال التجاري',
            businessAddress: 'عنوان العمل',
            businessLocation: 'موقع العمل',
            searchLocation: 'ابحث عن موقع...'
        },
        password: {
            title: 'تغيير كلمة المرور',
            current: 'كلمة المرور الحالية',
            new: 'كلمة المرور الجديدة',
            confirm: 'تأكيد كلمة المرور الجديدة',
            mismatch: 'كلمتا المرور الجديدتان غير متطابقتين.'
        },
        notifications: {
            title: 'إعدادات الإشعارات',
            subtitle: 'اختر كيف تريد أن يتم إعلامك. سنعلمك دائمًا بالتغييرات المهمة، ولكن يمكنك اختيار ما تريد أن تسمع عنه أيضًا.',
            opportunities: {
                title: 'فرص استثمارية جديدة',
                description: 'احصل على إشعارات عند إدراج صناديق أو أسهم جديدة تتوافق مع اهتماماتك.'
            },
            portfolio: {
                title: 'تحديثات المحفظة',
                description: 'استقبل ملخصات أسبوعية وإشعارات حول التغييرات الهامة في قيمة محفظتك.'
            },
            security: {
                title: 'تنبيهات أمنية',
                description: 'احصل على إشعارات حول عمليات تسجيل الدخول الجديدة وتغييرات كلمة المرور والأحداث الأخرى المتعلقة بالأمان.'
            },
            news: {
                title: 'أخبار السوق والرؤى',
                description: 'استقبل نشرتنا الإخبارية مع أحدث تحليلات السوق والرؤى من خبرائنا.'
            }
        },
        verified: 'تم التحقق',
        pending: 'في انتظار التحقق',
        saveButton: 'حفظ التغييرات'
    },
    // Admin Notifications
    notifications: {
        title: 'الإشعارات',
        all: 'الكل',
        unread: 'غير مقروء',
        delete: 'حذف الإشعار',
        noNotifications: {
            title: 'لا توجد إشعارات',
            allCaughtUp: 'أنت على اطلاع دائم!',
            subtitle: 'ستظهر إشعاراتك هنا.'
        }
    }
  },
};

type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  language = signal<Language>(this.getInitialLanguage());
  
  private dictionaries = TRANSLATIONS;
  
  dictionary = computed(() => this.dictionaries[this.language()]);

  direction = computed<'ltr' | 'rtl'>(() => this.language() === 'ar' ? 'rtl' : 'ltr');

  private getInitialLanguage(): Language {
    const savedLang = localStorage.getItem('investa-lang');
    return (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
  }
  
  setLanguage(lang: Language) {
    this.language.set(lang);
    localStorage.setItem('investa-lang', lang);
  }

  toggleLanguage() {
    this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
  }
  
}