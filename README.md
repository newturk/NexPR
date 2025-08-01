# 🚀 AI-Powered PR Campaign Analysis Platform

A comprehensive AI-driven platform that combines **Qloo's Taste AI™ API** for cultural intelligence with **Google Gemini AI** for strategic PR campaign analysis. Built for data-driven marketing professionals who need location-specific cultural insights and automated PR strategy generation.

## ✨ Core Features

### 🎯 **Cultural Intelligence Engine**
- **Qloo API Integration**: Real-time cultural intelligence from Qloo's Taste AI™ API
- **Global Location Support**: Analyze any location worldwide with cultural insights
- **Demographic Analysis**: Age-based brand engagement and cultural preferences
- **Brand Affinity Mapping**: Cultural relevance scores and popularity metrics

### 🤖 **AI-Powered Strategy Generation**
- **Google Gemini AI**: Advanced analysis using Gemini 2.0 Flash
- **Comprehensive PR Strategy**: 10 essential PR categories covered
- **Automated Campaign Planning**: Generate complete PR strategies from cultural data
- **Interactive AI Chatbot**: Get real-time assistance and strategy refinement

### 📊 **Advanced Analytics Dashboard**
- **Interactive Visualizations**: Dynamic charts using Chart.js
- **Cultural Relevance Scoring**: Multi-dimensional cultural alignment metrics
- **Location Intelligence**: Top locations with cultural evidence
- **Real-Time Data Processing**: Live API responses, no hardcoded data

### 🎨 **Modern User Experience**
- **React 18 + Vite**: Fast, modern development stack
- **Tailwind CSS**: Beautiful, responsive design
- **Mobile-First Design**: Optimized for all devices
- **Smooth Animations**: Professional UI with engaging interactions

## 🎯 **10 Essential PR Analysis Categories**

1. **Brand Analysis** - Cultural positioning and brand perception
2. **Competitive Intelligence** - Market competitor insights and positioning
3. **Geographic Intelligence** - Location-based market opportunities
4. **Demographic Analysis** - Target audience cultural preferences
5. **Influencer Discovery** - Cultural influencer identification and matching
6. **Venue & Media Discovery** - Strategic venue and media outlet recommendations
7. **Cultural Partnerships** - Cultural collaboration opportunities
8. **Trending Analysis** - Cultural trend identification and relevance
9. **Content Intelligence** - Content strategy optimization based on cultural insights
10. **Crisis Management** - Risk assessment and cultural sensitivity analysis

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing

### **Data Visualization**
- **Chart.js** - Interactive charts and graphs
- **React-Chartjs-2** - React wrapper for Chart.js

### **AI & APIs**
- **Google Gemini AI** - Advanced AI analysis (gemini-2.0-flash)
- **Qloo Taste AI™ API** - Cultural intelligence and demographic data
- **Real-time API Integration** - Live data processing and analysis

### **UI/UX Components**
- **Lucide React** - Beautiful, consistent iconography
- **React Hot Toast** - User notifications and feedback
- **React Dropzone** - File upload functionality

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/newturk/NexPR.git
   cd NexPR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_QLOO_API_KEY=your_qloo_api_key_here
   VITE_QLOO_BASE_URL=https://hackathon.api.qloo.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📋 How to Use

### 1. **Campaign Setup**
- Enter your brand name, product details, and category
- Specify target location (any global location supported)
- Set campaign scope and budget range
- Add additional notes and upload supporting files

### 2. **AI Analysis Process**
- Click "Generate PR Campaign Analysis"
- System automatically queries Qloo API for cultural intelligence
- Gemini AI analyzes cultural data and generates comprehensive strategy
- Real-time processing with progress indicators

### 3. **Results & Analytics**
- View comprehensive PR strategy with cultural insights
- Explore interactive charts and visualizations
- Access location-specific recommendations
- Use AI chatbot for strategy refinement

### 4. **Strategy Refinement**
- Interactive chatbot for Q&A about your campaign
- Get additional insights and recommendations
- Refine strategy based on cultural intelligence

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key | Yes | - |
| `VITE_QLOO_API_KEY` | Qloo Taste AI™ API key | Yes | - |
| `VITE_QLOO_BASE_URL` | Qloo API base URL | No | `https://hackathon.api.qloo.com` |

### API Endpoints

The platform integrates with:
- **Qloo API**: Cultural intelligence and demographic data
- **Google Gemini AI**: Strategy generation and analysis

## 📁 Project Structure

```
Market_Analysis/
├── src/
│   ├── components/
│   │   ├── AnalysisResults.jsx    # Analytics dashboard and results
│   │   ├── CampaignBuilder.jsx    # Campaign form and setup
│   │   ├── Chatbot.jsx            # AI assistant chatbot
│   │   ├── Header.jsx             # Navigation header
│   │   └── RobotLoader.jsx        # Loading animations
│   ├── services/
│   │   ├── enhancedQlooService.js # Qloo API integration
│   │   ├── geminiService.js       # Gemini AI integration
│   │   └── qlooTypes.js           # Type definitions
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Key Capabilities

### **Cultural Intelligence**
- **Global Location Support**: Analyze any location worldwide
- **Real Cultural Data**: No hardcoded data - all insights from live APIs
- **Demographic Insights**: Age-based cultural preferences and engagement
- **Brand Affinity Analysis**: Cultural relevance and popularity metrics

### **AI-Powered Strategy**
- **Comprehensive Analysis**: 10 essential PR categories covered
- **Location-Specific Recommendations**: Tailored strategies for target markets
- **Cultural Sensitivity**: Risk assessment and cultural alignment
- **Automated Planning**: Generate complete PR strategies from cultural data

### **Interactive Experience**
- **Real-Time Processing**: Live API queries and analysis
- **Visual Analytics**: Interactive charts and data visualization
- **AI Assistant**: Chatbot for strategy refinement and Q&A
- **Responsive Design**: Works seamlessly across all devices

## 🔒 Security & Privacy

- **Environment Variables**: API keys stored securely
- **No Data Storage**: Sensitive data not logged or stored
- **Secure API Communication**: Proper headers and authentication
- **Client-Side Validation**: Input validation and sanitization

## 🚀 Deployment

### **Netlify (Recommended)**
1. Connect GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### **Vercel**
1. Import GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

### **Manual Deployment**
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Qloo** for providing the Taste AI™ API and hosting the LLM Hackathon
- **Google** for Gemini AI capabilities and API access
- **React** and **Vite** communities for excellent development tooling
- **Chart.js** for beautiful data visualizations

## 👨‍💻 Author

**Shubham Kumar** - Built for Qloo LLM Hackathon

## 📞 Support

For support, create an issue in this repository or contact the author.

---

**Built with ❤️ for the Qloo LLM Hackathon** 