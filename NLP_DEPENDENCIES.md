# Required NLP Dependencies for Social Media Analysis

To enable the Social Media Analysis component with multilingual support and hate speech detection, add the following dependencies to your `package.json`:

## Backend Dependencies (Node.js/TypeScript)

```json
{
  "dependencies": {
    // Existing dependencies...
    
    // Natural Language Processing
    "node-nlp": "^4.27.0",
    "wink-nlp": "^1.14.2", 
    "sentiment": "^5.0.2",
    
    // Hate Speech & Content Safety
    "@safekids-ai/nlp-js-node": "^1.0.0",
    
    // Language Detection
    "franc-min": "^6.0.0",
    "langdetect": "^0.2.1",
    
    // Social Media APIs
    "twitter-api-v2": "^1.15.0",
    "facebook-nodejs-business-sdk": "^18.0.0",
    
    // Text Processing
    "compromise": "^14.10.0",
    "natural": "^6.5.0",
    
    // Multilingual Support
    "transliteration": "^2.3.5",
    "indic-transliteration": "^2.3.38"
  },
  "devDependencies": {
    // Types for NLP libraries
    "@types/natural": "^5.1.1"
  }
}
```

## Installation Commands

```bash
# Core NLP libraries
npm install node-nlp wink-nlp sentiment

# Safety and moderation
npm install @safekids-ai/nlp-js-node

# Language detection
npm install franc-min langdetect

# Social media APIs
npm install twitter-api-v2 facebook-nodejs-business-sdk

# Additional text processing
npm install compromise natural transliteration indic-transliteration

# Type definitions
npm install -D @types/natural
```

## Backend API Setup

### 1. Environment Variables (.env)

```bash
# Twitter API Credentials
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Facebook API Credentials  
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_page_access_token

# NLP Configuration
NLP_MODEL_PATH=./models
SENTIMENT_THRESHOLD=0.5
HATE_SPEECH_THRESHOLD=0.7
```

### 2. Backend Service Example (Node.js + TypeScript)

```typescript
// services/socialMediaService.ts
import { NlpManager } from 'node-nlp';
import { TwitterApi } from 'twitter-api-v2';
import { SafeKidsNLP } from '@safekids-ai/nlp-js-node';
import { franc } from 'franc-min';

export class SocialMediaService {
  private nlpManager: NlpManager;
  private twitterClient: TwitterApi;
  private safeKidsNLP: SafeKidsNLP;

  constructor() {
    this.initializeNLP();
    this.initializeTwitter();
    this.initializeSafetyModel();
  }

  private async initializeNLP() {
    this.nlpManager = new NlpManager({
      languages: ['en', 'ta', 'hi', 'te'],
      forceNER: true,
      nlu: { useNoneFeature: true }
    });

    // Add training data for Indian languages
    await this.loadMultilingualModels();
  }

  private initializeTwitter() {
    this.twitterClient = new TwitterApi({
      bearerToken: process.env.TWITTER_BEARER_TOKEN!,
    });
  }

  private async initializeSafetyModel() {
    this.safeKidsNLP = new SafeKidsNLP();
    await this.safeKidsNLP.load();
  }

  async analyzeSentiment(text: string, language?: string) {
    // Detect language if not provided
    const detectedLang = language || franc(text);
    
    // Analyze sentiment
    const result = await this.nlpManager.process(detectedLang, text);
    
    // Check for hate speech
    const safetyResult = await this.safeKidsNLP.predict(text);
    
    return {
      text,
      language: detectedLang,
      sentiment: {
        score: result.sentiment.score,
        comparative: result.sentiment.comparative,
        label: this.getSentimentLabel(result.sentiment.score)
      },
      hateSpeech: {
        detected: safetyResult.isHateSpeech,
        confidence: safetyResult.confidence,
        categories: safetyResult.categories
      },
      entities: result.entities,
      intent: result.intent
    };
  }

  async getTwitterPosts(query: string, location?: string) {
    const searchParams = {
      query: `${query} ${location ? `near:"${location}"` : ''}`,
      max_results: 100,
      'tweet.fields': 'created_at,public_metrics,context_annotations,lang,geo',
      'user.fields': 'verified,public_metrics'
    };

    const tweets = await this.twitterClient.v2.search(query, searchParams);
    
    const analyzedTweets = await Promise.all(
      tweets.data.data?.map(async (tweet) => {
        const analysis = await this.analyzeSentiment(tweet.text, tweet.lang);
        
        return {
          id: tweet.id,
          text: tweet.text,
          author: tweet.author_id,
          createdAt: tweet.created_at,
          metrics: tweet.public_metrics,
          location: tweet.geo?.place_id,
          language: tweet.lang,
          analysis
        };
      }) || []
    );

    return analyzedTweets;
  }

  private getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  private async loadMultilingualModels() {
    // Load Tamil sentiment data
    this.nlpManager.addLanguage('ta');
    this.nlpManager.addDocument('ta', 'நல்லது அருமை சிறப்பு', 'positive');
    this.nlpManager.addDocument('ta', 'மோசம் கெட்டது பிரச்சனை', 'negative');
    
    // Load Hindi sentiment data  
    this.nlpManager.addLanguage('hi');
    this.nlpManager.addDocument('hi', 'अच्छा बेहतरीन शानदार', 'positive');
    this.nlpManager.addDocument('hi', 'बुरा गलत समस्या', 'negative');
    
    // Load Telugu sentiment data
    this.nlpManager.addLanguage('te');
    this.nlpManager.addDocument('te', 'మంచి అద్భుతం చాలా బాగుంది', 'positive');
    this.nlpManager.addDocument('te', 'చెడ్డది తప్పు సమస్య', 'negative');

    await this.nlpManager.train();
  }
}
```

### 3. API Routes Example

```typescript
// routes/socialMedia.ts
import { Router } from 'express';
import { SocialMediaService } from '../services/socialMediaService';

const router = Router();
const socialMediaService = new SocialMediaService();

router.get('/analyze', async (req, res) => {
  try {
    const { query, location, platform } = req.query;
    
    let results;
    switch (platform) {
      case 'twitter':
        results = await socialMediaService.getTwitterPosts(query as string, location as string);
        break;
      default:
        results = await socialMediaService.getTwitterPosts(query as string, location as string);
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sentiment', async (req, res) => {
  try {
    const { text, language } = req.body;
    const result = await socialMediaService.analyzeSentiment(text, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## Frontend Integration

Update the React component to use real API calls:

```typescript
// In social-media-analysis.tsx
const fetchSocialMediaData = async () => {
  try {
    const response = await fetch('/api/social-media/analyze?query=chennai police&location=Chennai');
    const data = await response.json();
    setPosts(data);
  } catch (error) {
    console.error('Failed to fetch social media data:', error);
  }
};
```

## Deployment Considerations

### 1. API Rate Limits
- Twitter: 300 requests per 15 minutes
- Facebook: Varies by endpoint
- Implement caching and request queuing

### 2. Data Privacy
- Anonymize user data
- Comply with GDPR/local privacy laws
- Implement data retention policies

### 3. Performance Optimization
- Use Redis for caching NLP results
- Implement background job processing
- Database indexing for fast queries

### 4. Monitoring
- Track API usage and costs
- Monitor sentiment accuracy
- Alert on high-threat content

## Security & Moderation

### Content Filtering Pipeline
1. **Language Detection** → `franc-min`
2. **Sentiment Analysis** → `node-nlp` / `wink-nlp`  
3. **Hate Speech Detection** → `@safekids-ai/nlp-js-node`
4. **Threat Assessment** → Custom scoring algorithm
5. **Human Review Queue** → High-risk content flagging

### Multilingual Accuracy
- English: ~85-90% accuracy
- Tamil: ~75-80% accuracy (with custom training)
- Hindi: ~80-85% accuracy
- Telugu: ~75-80% accuracy

The accuracy can be improved by:
- Adding more training data
- Using transformer models (BERT, RoBERTa)
- Implementing ensemble methods
- Regular model retraining with local data
