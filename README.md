# 🚀 AI PR Campaign Platform

A cutting-edge AI-powered PR campaign analysis platform that leverages **Qloo's Taste AI™ API** for cultural intelligence and **Google Gemini AI** for comprehensive campaign strategy generation. Built for the **Qloo LLM Hackathon**.

## ✨ Features

### 🎯 **AI-Powered Cultural Intelligence**
- **Qloo API Integration**: Real cultural intelligence data from Qloo's Taste AI™ API
- **Gemini AI Analysis**: Advanced AI analysis using Google Gemini 2.0 Flash
- **Location-Specific Insights**: Tailored analysis for any global location
- **Real-Time Data**: No hardcoded data - all insights from live API responses

### 📊 **Comprehensive Analytics Dashboard**
- **Population Heatmap**: Age-based brand engagement analysis
- **Brand Affinity Distribution**: Popularity and engagement metrics
- **Cultural Relevance Scores**: Multi-dimensional cultural alignment
- **Location Intelligence**: Top locations with cultural evidence
- **Real-Time Charts**: Dynamic visualizations using Chart.js

### 🎨 **Modern UI/UX**
- **React + Vite**: Fast, modern development experience
- **Tailwind CSS**: Beautiful, responsive design
- **Interactive Components**: Smooth animations and transitions
- **Mobile Responsive**: Works perfectly on all devices

### 🔍 **10 Essential PR Categories**
1. **Brand Analysis** - Cultural brand positioning
2. **Competitive Intelligence** - Market competitor insights
3. **Geographic Intelligence** - Location-based market analysis
4. **Demographic Analysis** - Target audience insights
5. **Influencer Discovery** - Cultural influencer identification
6. **Venue & Media Outlet Discovery** - Strategic venue recommendations
7. **Cultural Partnerships** - Cultural collaboration opportunities
8. **Trending Analysis** - Cultural trend identification
9. **Content Intelligence** - Content strategy optimization
10. **Crisis Management** - Risk assessment and mitigation

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js + React-Chartjs-2** - Interactive data visualizations
- **React Router DOM** - Client-side routing
- **React Hot Toast** - User notifications
- **Lucide React** - Beautiful icons

### **AI & APIs**
- **Google Gemini AI** - Advanced AI analysis (gemini-2.0-flash)
- **Qloo Taste AI™ API** - Cultural intelligence data
- **Real-time API Integration** - Live data processing

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

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

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_QLOO_API_KEY=your_qloo_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Usage

### 1. **Campaign Setup**
- Enter your brand name, category, and product details
- Specify your target location and scope
- Add budget information and additional notes
- Upload supporting files (optional)

### 2. **AI Analysis**
- Click "Advanced Analysis with Qloo API"
- System generates comprehensive Qloo API queries
- Real-time cultural intelligence data collection
- AI-powered analysis of cultural insights

### 3. **Comprehensive PR Strategy**
- Click "Generate PR Campaign Analysis"
- Receive complete PR strategy based on cultural intelligence
- Get location-specific recommendations
- Access data-driven insights and metrics

### 4. **Analytics Dashboard**
- View interactive charts and visualizations
- Explore cultural relevance scores
- Analyze demographic insights
- Review location-specific recommendations

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `VITE_QLOO_API_KEY` | Qloo Taste AI™ API key | Yes |

### API Configuration

The platform is configured to work with:
- **Qloo API Base URL**: `https://hackathon.api.qloo.com`
- **Gemini Model**: `gemini-2.0-flash`

## 📁 Project Structure

```
NexPR/
├── public/
├── src/
│   ├── components/
│   │   ├── AnalysisResults.jsx    # Analytics dashboard
│   │   ├── CampaignBuilder.jsx    # Campaign form
│   │   ├── Header.jsx             # Navigation header
│   │   └── FileUpload.jsx         # File upload component
│   ├── services/
│   │   └── geminiService.js       # AI and API services
│   ├── App.jsx                    # Main application
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Key Features Explained

### **Cultural Intelligence Integration**
The platform leverages Qloo's Taste AI™ API to provide:
- **Real cultural insights** for any global location
- **Demographic analysis** based on cultural preferences
- **Influencer discovery** with cultural relevance
- **Venue recommendations** with cultural alignment

### **AI-Powered Analysis**
Google Gemini AI provides:
- **Comprehensive PR strategy** generation
- **Cultural relevance scoring**
- **Location-specific recommendations**
- **Data-driven insights** and metrics

### **Real-Time Data Processing**
- **No hardcoded data** - all insights from live APIs
- **Dynamic query generation** based on user input
- **Real-time cultural intelligence** updates
- **Location-specific analysis** for any global market

## 🔒 Security

- **API keys** are stored in environment variables
- **No sensitive data** is logged or stored
- **Secure API communication** with proper headers
- **Client-side validation** for all inputs

## 🚀 Deployment

### **Netlify Deployment**
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### **Vercel Deployment**
1. Import your GitHub repository to Vercel
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
- **Google** for Gemini AI capabilities
- **React** and **Vite** communities for excellent tooling
- **Chart.js** for beautiful data visualizations

## 👨‍💻 Author

**Shubham Kumar** - Built for Qloo LLM Hackathon

## 📞 Support

For support, create an issue in this repository or contact the author.

---

**Built with ❤️ for the Qloo LLM Hackathon** 