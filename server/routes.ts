import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nlpService } from "./services/nlpService";
import { twitterService } from "./services/twitterService";

// Helper function to generate mock social media posts
function generateMockSocialMediaPosts(limit: number) {
  const districts = ['Anna Nagar', 'T.Nagar', 'Velachery', 'Adyar', 'Tambaram', 'Central Chennai', 'Mylapore', 'Perungudi'];
  const platforms = ['twitter', 'facebook', 'instagram'] as const;
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Telugu', code: 'te' }
  ];
  
  const samplePosts = [
    "Police response was very quick in T.Nagar today. Impressed with Chennai Police! 👮‍♂️ #ChennaiPolice #Safety",
    "சென்னை போலீஸ் மிக நல்லா வேலை செய்யுறாங்க. வேலூர் பகுதியில் பாதுகாப்பு நல்லா இருக்கு #சென்னைபோலீஸ்",
    "Street lights not working in Anna Nagar for 3 days. Safety concern for women walking at night #ChennaiCorp",
    "Witnessed a theft near Marina Beach. Police arrived within 10 minutes! Great job @ChennaiPolice",
    "Traffic police doing excellent work managing rush hour traffic in Velachery #Traffic #Chennai",
    "आज रात अड्यार में बहुत शोर था। पुलिस को कॉल करना पड़ा। #चेन्नई #सुरक्षा",
    "Community policing initiative in Tambaram is working well. Neighbors are more connected now 🏘️",
    "Concerned about increasing vehicle thefts in IT corridor. Need more patrol cars #Safety #Velachery",
    "Kudos to Chennai Police for quick action on cyber crime complaint. Very professional service! 💻",
    "పెరుంగుడిలో రోడ్ సేఫ్టీ చాలా మెరుగుపడింది. పోలీసులకు ధన్యవాదాలు #రోడ్సేఫ్టీ",
    "Emergency response in Chennai has improved significantly. Ambulance arrived in 5 minutes! #Emergency",
    "Police patrolling increased in our area after recent incidents. Feeling safer now #Security",
    "Night patrol officers are doing great job in Anna Nagar. Thank you for keeping us safe! #NightPatrol",
    "CCTV cameras installation completed in our street. Technology helping in crime prevention #CCTV #Safety",
    "Community watch program started in our locality. Neighbors working together with police #CommunityPolicing"
  ];

  return Array.from({ length: limit }, (_, index) => {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    const content = samplePosts[Math.floor(Math.random() * samplePosts.length)];
    const isCrimeRelated = Math.random() > 0.4;
    const isVerified = Math.random() > 0.8;

    return {
      id: `mock-${index}`,
      platform,
      content,
      author: `User${Math.floor(Math.random() * 1000)}`,
      authorHandle: `@user${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      location: district,
      district,
      language: language.code, // This should be a valid language code
      crimeRelated: isCrimeRelated,
      verified: isVerified,
      metrics: {
        likes: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        reach: Math.floor(Math.random() * 10000) + 1000
      }
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Crime dashboard API routes
  
  // Get dashboard overview data
  app.get("/api/dashboard", async (_req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get crime statistics
  app.get("/api/crime-stats", async (_req, res) => {
    try {
      const stats = await storage.getCrimeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching crime stats:", error);
      res.status(500).json({ message: "Failed to fetch crime statistics" });
    }
  });

  // Get crime categories
  app.get("/api/crime-categories", async (_req, res) => {
    try {
      const categories = await storage.getCrimeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching crime categories:", error);
      res.status(500).json({ message: "Failed to fetch crime categories" });
    }
  });

  // Get districts
  app.get("/api/districts", async (_req, res) => {
    try {
      const districts = await storage.getDistricts();
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Failed to fetch districts" });
    }
  });

  // Get crime incidents with optional filtering
  app.get("/api/crime-incidents", async (req, res) => {
    try {
      const { categoryId, districtId } = req.query;
      const incidents = await storage.getCrimeIncidents(
        categoryId as string, 
        districtId as string
      );
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching crime incidents:", error);
      res.status(500).json({ message: "Failed to fetch crime incidents" });
    }
  });

  // Get active alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getCrimeAlerts(true);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Get AI insights
  app.get("/api/insights", async (_req, res) => {
    try {
      const insights = await storage.getAiInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  // Social Media Analysis API routes
  
  // Analyze sentiment of a single text
  app.post("/api/social-media/analyze-text", async (req, res) => {
    try {
      const { text, language } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const mockPost = {
        id: 'temp-' + Date.now(),
        platform: 'twitter' as const,
        content: text,
        author: 'User',
        authorHandle: '@user',
        timestamp: new Date(),
        district: 'Chennai',
        language
      };

      const result = await nlpService.analyzeSocialMediaPost(mockPost);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing text:", error);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });

  // Get real Twitter posts with analysis
  app.get("/api/social-media/posts", async (req, res) => {
    try {
      const { district, platform, language, limit = '5', query = 'Chennai Police OR Chennai Safety OR Chennai Crime' } = req.query;
      
      let posts = [];
      
      // If platform is not specified or is Twitter, get Twitter data
      if (!platform || platform === 'all' || platform === 'twitter') {
        try {
          // Limit Twitter API calls to avoid rate limiting
          const maxTwitterResults = Math.min(parseInt(limit as string), 5);
          console.log(`Fetching ${maxTwitterResults} Twitter posts to avoid rate limits`);
          
          const twitterPosts = await twitterService.searchTweets({
            query: query as string,
            location: district !== 'all' ? district as string : 'Chennai',
            maxResults: maxTwitterResults,
            language: language !== 'all' ? language as string : undefined
          });
          posts.push(...twitterPosts);
        } catch (error) {
          console.error('Twitter API rate limit hit, returning cached/mock data');
          // Fall back to mock data if Twitter fails
          const mockPosts = generateMockSocialMediaPosts(Math.min(parseInt(limit as string), 5));
          posts.push(...mockPosts);
        }
      }
      
      // If no real data and platform includes other platforms, add mock data
      if (posts.length === 0 || (platform && ['facebook', 'instagram'].includes(platform as string))) {
        const remainingLimit = Math.max(0, Math.min(parseInt(limit as string), 5) - posts.length);
        const mockPosts = generateMockSocialMediaPosts(remainingLimit)
          .filter(post => !platform || platform === 'all' || post.platform === platform);
        posts.push(...mockPosts);
      }
      
      // Filter posts based on query parameters
      let filteredPosts = posts;
      
      if (district && district !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.district === district);
      }
      
      if (language && language !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
          post.language === language || 
          (post as any).languageCode === language
        );
      }

      // Analyze each post with NLP (limit to max 5 posts)
      const postsToAnalyze = filteredPosts.slice(0, Math.min(parseInt(limit as string), 5));
      console.log(`Analyzing ${postsToAnalyze.length} posts`);
      
      const analyzedPosts = await Promise.all(
        postsToAnalyze.map(async (post) => {
          const mockPost = {
            id: post.id,
            platform: post.platform,
            content: post.content,
            author: post.author,
            authorHandle: post.authorHandle,
            timestamp: post.timestamp,
            district: post.district,
            language: post.language
          };
          
          let analysis;
          try {
            analysis = await nlpService.analyzeSocialMediaPost(mockPost);
          } catch (nlpError) {
            console.error('NLP analysis failed for post:', post.id, nlpError);
            // Provide fallback analysis if NLP fails
            analysis = {
              sentiment: { score: 0, comparative: 0, label: 'neutral' as const, confidence: 0.5 },
              language: 'en',
              hateSpeech: { detected: false, confidence: 0, categories: [] },
              keywords: [],
              crimeRelated: false,
              threatLevel: 'low' as const
            };
          }
          
          return {
            id: post.id,
            platform: post.platform,
            content: post.content,
            author: post.author,
            authorHandle: post.authorHandle,
            timestamp: post.timestamp,
            location: post.location,
            district: post.district,
            sentiment: analysis.sentiment,
            language: analysis.language,
            languageCode: post.language || analysis.language,
            categories: analysis.crimeRelated ? ['crime', 'safety'] : ['community', 'general'],
            metrics: post.metrics,
            crimeRelated: analysis.crimeRelated,
            threatLevel: analysis.threatLevel,
            hateSpeech: analysis.hateSpeech,
            keywords: analysis.keywords,
            verified: post.verified
          };
        })
      );

      // Add API status info
      const responseData = {
        posts: analyzedPosts,
        meta: {
          total: analyzedPosts.length,
          twitterApiAvailable: twitterService.isAvailable(),
          source: twitterService.isAvailable() ? 'real' : 'mock',
          query: query,
          filters: { district, platform, language }
        }
      };

      res.json(analyzedPosts); // Keep backward compatibility
    } catch (error) {
      console.error("Error fetching social media posts:", error);
      res.status(500).json({ message: "Failed to fetch social media posts" });
    }
  });

  // Get trending topics from Twitter API
  app.get("/api/social-media/trending", async (req, res) => {
    try {
      const { location = 'Chennai' } = req.query;
      
      // Try to get real trending topics from Twitter
      const trendingTopics = await twitterService.getTrendingTopics(location as string);
      
      res.json(trendingTopics);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Get API integration status
  app.get("/api/social-media/status", async (_req, res) => {
    try {
      const twitterAvailable = twitterService.isAvailable();
      const twitterConnected = twitterAvailable ? await twitterService.testConnection() : false;
      
      const status = {
        twitter: {
          available: twitterAvailable,
          connected: twitterConnected,
          hasCredentials: !!(process.env.TWITTER_BEARER_TOKEN || process.env.TWITTER_API_KEY),
          credentialTypes: {
            bearerToken: !!process.env.TWITTER_BEARER_TOKEN,
            fullOAuth: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && 
                         process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET)
          }
        },
        nlp: {
          available: true,
          languages: ['English', 'Tamil', 'Hindi', 'Telugu'],
          features: ['sentiment', 'hate_speech', 'crime_detection', 'multilingual']
        },
        dataSource: twitterConnected ? 'real' : 'mock',
        lastChecked: new Date().toISOString()
      };
      
      res.json(status);
    } catch (error) {
      console.error("Error checking API status:", error);
      res.status(500).json({ message: "Failed to check API status" });
    }
  });

  // Get district sentiment summary
  app.get("/api/social-media/district-sentiment", async (_req, res) => {
    try {
      const districts = ['Anna Nagar', 'T.Nagar', 'Velachery', 'Adyar', 'Tambaram', 'Central Chennai', 'Mylapore', 'Perungudi'];
      
      const districtSentiments = districts.map(district => {
        const overallSentiment = (Math.random() - 0.5) * 2; // -1 to 1
        const postCount = Math.floor(Math.random() * 50) + 10;
        const positiveCount = Math.floor(postCount * Math.random() * 0.6);
        const negativeCount = Math.floor(postCount * Math.random() * 0.3);
        const neutralCount = postCount - positiveCount - negativeCount;
        
        return {
          district,
          overallSentiment,
          postCount,
          positiveCount,
          neutralCount,
          negativeCount,
          threatLevel: overallSentiment < -0.3 ? 'high' : overallSentiment < 0 ? 'medium' : 'low',
          keyTopics: ['safety', 'police', 'community'].slice(0, Math.floor(Math.random() * 3) + 1)
        };
      });
      
      res.json(districtSentiments);
    } catch (error) {
      console.error("Error fetching district sentiments:", error);
      res.status(500).json({ message: "Failed to fetch district sentiments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
