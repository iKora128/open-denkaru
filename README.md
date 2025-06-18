# Open Denkaru (オープン電カル)

> **次世代オープンソース電子カルテシステム**  
> *Next-Generation Open Source Electronic Medical Record System*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🎯 Project Vision

**Open Denkaru** is a revolutionary open-source Electronic Medical Record (EMR) system designed specifically for Japanese healthcare institutions. We're building more than just another EMR—we're creating a platform for **medical AI innovation**, **open-source collaboration**, and **global healthcare advancement**.

### 🌟 Core Mission

- **🏥 Japanese Healthcare First**: Complete compliance with Japanese medical regulations and practices
- **🤖 AI-Powered Innovation**: Cutting-edge local LLM integration for clinical decision support
- **🔓 Open Source Excellence**: Community-driven development with transparent, collaborative processes
- **🌍 Global Health Impact**: Contributing to worldwide healthcare technology advancement

---

## ⚡ What Makes Open Denkaru Different

### 🤖 AI-Assisted Development Environment
- **Local LLM Integration**: Ollama-powered development assistance
- **Vibe Coding**: Autonomous AI-supported development workflows
- **Innovation Sandbox**: Safe testing environment for experimental medical AI features
- **Continuous Learning**: AI that evolves with medical knowledge and development patterns

### 👨‍💻 Developer-First Design
- **Modern Tech Stack**: FastAPI + Next.js + PostgreSQL + TypeScript
- **Microservices Architecture**: Scalable, maintainable, and extensible
- **Comprehensive Testing**: 85%+ code coverage with medical safety validation
- **Docker-First**: One-command development environment setup

### 🔒 Privacy & Security by Design
- **Local-First**: All data processing on-premise, never in the cloud
- **Offline Resilience**: Full functionality during network outages
- **Zero-Trust Security**: Multiple layers of protection for medical data
- **Audit Everything**: Complete audit trails for regulatory compliance

### 📋 Standards Compliance
- **Japanese Regulations**: Full compliance with medical information system guidelines
- **International Standards**: HL7 FHIR, SS-MIX2, DICOM integration
- **ORCA Integration**: Seamless connection with Japanese billing systems
- **Future-Ready**: Quantum computing and emerging technology preparation

---

## 🚀 Development Phases

Our structured 6-phase approach ensures robust, tested functionality at every step:

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **Phase 1** | 4-6 weeks | 🏗️ **Foundation & PoC** | Docker environment, core MVP, local LLM |
| **Phase 2** | 6-8 weeks | ⚕️ **Core Functionality** | Prescription management, test orders, enhanced AI |
| **Phase 3** | 8-10 weeks | 🔐 **Security & Multi-user** | Authentication, audit logs, ORCA preparation |
| **Phase 4** | 10-12 weeks | 🏦 **ORCA Integration** | Complete Japanese billing system integration |
| **Phase 5** | 12-14 weeks | 📊 **Standards & AI** | FHIR, SS-MIX2, advanced clinical AI |
| **Phase 6** | 16-20 weeks | 🔬 **Innovation Lab** | Research platform, quantum computing, global health |

---

## 🛠️ Technology Stack

### Backend
- **🐍 Python 3.11+** with FastAPI for high-performance APIs
- **🐘 PostgreSQL** for robust medical data storage
- **📝 Redis** for caching and session management
- **🔄 RabbitMQ** for reliable message queuing

### Frontend
- **⚡ Next.js 14+** with App Router and Server Components
- **🏷️ TypeScript** for type-safe development
- **🎨 Tailwind CSS + Shadcn/ui** for beautiful, accessible interfaces
- **🔄 TanStack Query** for efficient data fetching

### Infrastructure
- **📦 Docker** with modern docker-compose setup
- **☸️ Kubernetes** for production orchestration
- **📊 Prometheus + Grafana** for monitoring
- **📋 ELK Stack** for logging and analysis

### AI & Innovation
- **🤖 Ollama** for local LLM integration
- **🧠 PyTorch** for custom medical AI models
- **📊 Jupyter** for research and experimentation
- **⚛️ Quantum Computing** preparation (Phase 6)

---

## 🏥 Key Features

### 🩺 Clinical Core
- **📋 Patient Management**: Comprehensive patient records with Japanese medical practices
- **📝 SOAP Clinical Records**: Structured clinical documentation
- **💊 Prescription Management**: Advanced medication safety and interaction checking
- **🧪 Laboratory Integration**: Seamless test ordering and result management
- **📱 Medical Imaging**: DICOM integration with AI-enhanced analysis

### 🤖 AI-Powered Assistance
- **🎯 Clinical Decision Support**: Evidence-based treatment recommendations
- **🎤 Voice Recognition**: Natural language clinical documentation
- **🔬 Medical Image AI**: Automated radiology and pathology analysis
- **📊 Predictive Analytics**: Risk assessment and early warning systems
- **🧬 Precision Medicine**: Personalized treatment optimization

### 🔐 Enterprise Security
- **🔑 Multi-factor Authentication**: TOTP, SMS, hardware token support
- **👥 Role-Based Access Control**: Granular permissions for medical staff
- **📊 Comprehensive Audit Logs**: Complete activity tracking for compliance
- **💾 Automated Backups**: Disaster recovery and business continuity

### 🌐 Interoperability
- **🔗 HL7 FHIR**: International healthcare data exchange
- **🏥 SS-MIX2**: Japanese medical data standardization
- **💰 ORCA Integration**: Seamless Japanese medical billing
- **🌍 Regional Networks**: Healthcare information sharing platforms

---

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** (latest version)
- **Git** for version control
- **Node.js 18+** and **Python 3.11+** for development

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/your-org/open-denkaru.git
cd open-denkaru

# Start the complete development environment
docker compose up -d

# Access the application
open http://localhost:3000
```

### Development Mode
```bash
# Install Python dependencies
uv sync

# Install Node.js dependencies
cd frontend && npm install

# Start development servers
npm run dev        # Frontend (Next.js)
uv run uvicorn main:app --reload  # Backend (FastAPI)
```

---

## 🎯 Current Status: Phase 1 - Foundation

### ✅ Completed
- **Architecture Design**: Modern FastAPI + Next.js + SQLModel stack
- **Design System**: Apple-inspired Liquid Glass UI components
- **Docker Environment**: Complete development setup
- **Core Models**: Patient management with SQLModel
- **Beautiful UI**: Elegant, medical-professional interface

### 🚧 In Progress
- **Database Migrations**: Alembic setup for SQLModel
- **API Integration**: Frontend-backend connectivity
- **Authentication**: Basic user management

### 📋 Next Steps
- **Patient Management**: Complete CRUD operations
- **Dashboard**: Medical professional workflow
- **Local LLM**: Ollama integration for AI assistance

---

## 💡 Design Philosophy

**Open Denkaru** follows a sophisticated design philosophy inspired by Apple's Human Interface Guidelines:

- **Medical-First UX**: Every interaction optimized for healthcare workflows
- **Elegant Simplicity**: Clean, uncluttered interfaces that reduce cognitive load
- **iPhone-like Fluidity**: Smooth animations and responsive interactions
- **Professional Aesthetics**: Sophisticated visual hierarchy without SaaS clutter

### 🎨 Liquid Glass Components
- **Glass Morphism**: Backdrop blur with subtle transparency
- **Apple Color System**: Primary blue (#007AFF), system grays, medical status colors
- **Fluid Animations**: Spring physics and Apple-timing curves
- **Medical Context**: PatientCard, VitalCard, StatusBadge with clinical relevance

---

## 🤝 Contributing

We welcome contributions from developers, healthcare professionals, researchers, and anyone passionate about improving healthcare technology!

### Getting Started
1. **Read our [Contributing Guide](CONTRIBUTING.md)**
2. **Check the [Issues](https://github.com/your-org/open-denkaru/issues)** for good first issues
3. **Join our [Discord Community](https://discord.gg/open-denkaru)** for discussions
4. **Fork the repository** and start coding!

### Ways to Contribute
- **🐛 Bug Reports**: Help us identify and fix issues
- **✨ Feature Requests**: Suggest new functionality
- **📚 Documentation**: Improve our guides and documentation
- **🧪 Testing**: Help test new features and edge cases
- **🌍 Translation**: Localization for international deployment
- **🎨 Design**: UI/UX improvements and accessibility enhancements

---

## 📚 Documentation

### For Developers
- **[Development Setup](docs/development/setup.md)** - Complete development environment guide
- **[Architecture Overview](docs/architecture/overview.md)** - System design and components
- **[Design System](docs/architecture/design-system.md)** - UI/UX guidelines and components
- **[API Documentation](docs/api/readme.md)** - Complete API reference

### For Healthcare Professionals
- **[User Manual](docs/user/manual.md)** - Complete user interface guide
- **[Clinical Workflows](docs/clinical/workflows.md)** - Medical practice integration
- **[Compliance Guide](docs/compliance/japanese-regulations.md)** - Japanese regulatory compliance

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Why MIT License?
- **Maximum Freedom**: Use, modify, and distribute freely
- **Commercial Friendly**: Enables widespread adoption in healthcare
- **Global Collaboration**: No barriers to international contribution
- **Innovation Catalyst**: Encourages derivative works and improvements

---

## 🌟 Vision for the Future

**Open Denkaru** is more than an EMR system—it's a **platform for healthcare innovation**. We envision a future where:

- **🤖 AI Augments Human Expertise**: Doctors supported by intelligent systems
- **🌍 Global Health Data**: Seamless, privacy-preserving health information sharing
- **🔬 Accelerated Medical Research**: Open data and collaborative research platforms
- **⚡ Continuous Innovation**: Community-driven feature development
- **🌈 Healthcare Equity**: Advanced healthcare technology accessible worldwide

Join us in building this future. **Welcome to Open Denkaru.**

---

<div align="center">

**Built with ❤️ by the Open Denkaru Community**

[⭐ Star us on GitHub](https://github.com/your-org/open-denkaru) | [💬 Join our Discord](https://discord.gg/open-denkaru) | [📚 Read the Docs](https://docs.open-denkaru.org)

</div>