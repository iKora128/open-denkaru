# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Open Denkaru" (オープン電カル), an open-source electronic medical record (EMR) system specifically designed for Japanese healthcare institutions. The project aims to create a modern, developer-friendly EMR that addresses the limitations of existing solutions like OpenEMR by providing complete compatibility with Japanese medical regulations and practices.

## Key Project Goals
- Developer-first design with easy modification and extension capabilities
- Modular architecture allowing selective feature adoption
- Full compliance with Japanese medical regulations (レセプト, 保険診療, etc.)
- Community-driven development centered around GitHub

## Development Environment

### Package Management
- **uv**: Python package manager (preferred over pip/poetry)
- Common commands:
  ```bash
  uv sync                    # Install dependencies
  uv run python -m mypackage # Run Python modules
  uv add <package>          # Add dependencies
  ```

### Project Structure
- **docs/research/**: Contains detailed requirements and research documents
  - `chatgpt-search.md`: Comprehensive requirements document with 6-phase development plan
  - `claude-search.md`: Technical specifications and architecture details
- **pyproject.toml**: Python project configuration using modern standards

## Development Phases (Roadmap)

### Phase 1: PoC (Proof of Concept)
- Basic patient registration and management
- Simple clinical record input (SOAP format)
- User authentication and basic navigation
- Single-user operation (no complex auth yet)

### Phase 2: Basic Functionality
- Enhanced data persistence (PostgreSQL/MySQL)
- Patient search and sorting
- SOAP-structured clinical record UI
- Basic prescription and test order entry
- Simple prescription form output

### Phase 3: Multi-user and Security
- User authentication and role-based access control
- Audit logging and operation tracking
- Security enhancements (HTTPS, security headers)
- Data backup mechanisms

### Phase 4: ORCA Integration
- Integration with ORCA (Japan Medical Association standard receipt software)
- Automated billing data exchange
- Medical fee calculation rule compliance
- Patient insurance information synchronization

### Phase 5: Standards Compliance
- HL7 FHIR API implementation
- SS-MIX2 standard storage support
- Regional medical network connectivity
- Laboratory and imaging system integration

### Phase 6: AI Enhancement (Optional)
- Medical image AI analysis integration
- Voice input and NLP support
- Clinical decision support AI
- Predictive analytics

## Technology Stack (2025 Modern Standards)

### Frontend Architecture Decision

**🎯 Production-Ready Choice**: After analyzing medical EMR/EHR production systems, we choose **battle-tested technologies** for maximum robustness and development speed:

#### Primary Frontend Framework: **Next.js 14 + React 18**
- **Battle-Tested**: Proven in production medical systems (Tensor EMR, multiple healthcare platforms)
- **Robust Ecosystem**: Extensive medical libraries, UI components, and tooling
- **Development Speed**: Rapid development with hot reloading, automatic routing
- **Performance**: Server-Side Rendering for fast load times critical in medical settings
- **Security**: HIPAA/GDPR compliance capabilities well-established
- **Interoperability**: Strong HL7 FHIR integration libraries available

#### Why Stable Versions (Next.js 14 + React 18)
- **Medical-Grade Reliability**: Fully stable APIs, no breaking changes
- **Extensive Testing**: Battle-tested in production healthcare environments
- **Library Compatibility**: Full ecosystem support, no compatibility issues
- **Long-term Support**: Guaranteed stability for mission-critical medical systems

### Technology Requirements (2025 Standards)

**Always use the latest stable versions and modern APIs:**

#### Backend (Battle-Tested Stack)
- **Python 3.11+** (stable, excellent performance)
- **FastAPI 0.110+** (proven in medical systems, excellent OpenAPI docs)
- **SQLAlchemy 2.0+** (mature ORM with async support)
- **Pydantic v2** (robust data validation, widespread adoption)
- **PostgreSQL 15+** (rock-solid, ACID compliance for medical data)
- **Redis 7.0+** (stable caching, session management)
- **Alembic** (reliable database migrations)

#### Frontend (Medical-Grade Stack)
- **Next.js 14** (stable App Router, proven SSR performance)
- **React 18** (fully stable, extensive medical library ecosystem)
- **TypeScript 5.3+** (mature, excellent IDE support)
- **React Query v4** (battle-tested data fetching)
- **Zustand** (lightweight, reliable state management)
- **React Hook Form** (performant form handling for medical forms)

#### UI and Styling (Production-Ready)
- **Tailwind CSS 3.4+** (stable utility-first CSS)
- **Headless UI** (accessible components by Tailwind team)
- **Radix UI** (robust primitives for complex medical UIs)
- **React ARIA** (Adobe's accessibility library for medical compliance)
- **Framer Motion** (stable animations for smooth UX)

#### Infrastructure (Production-Proven)
- **Docker 24.0+** (stable LTS, widely deployed)
- **Docker Compose** (simple orchestration for most cases)
- **Nginx 1.24+** (rock-solid reverse proxy/load balancer)
- **GitHub Actions** (mature CI/CD, excellent ecosystem)
- **Prometheus 2.45+** + **Grafana 10.0+** (industry standard monitoring)
- **PostgreSQL** native replication (built-in HA solution)

#### AI/ML Integration (Stable & Reliable)
- **Ollama** (local LLM deployment, production-ready)
- **OpenAI API** (fallback for critical features)
- **scikit-learn** (battle-tested ML library)
- **PyTorch 2.0+** (stable LTS, extensive medical AI usage)
- **Transformers 4.30+** (proven Hugging Face library)
- **ONNX Runtime** (optimized inference, Microsoft-backed)

#### Development Tools (Proven Workflow)
- **uv** (modern Python package management)
- **npm** or **pnpm** (stable Node.js package management)
- **ESLint 8.x** (stable linting)
- **Prettier 3.x** (consistent code formatting)
- **Husky** (Git hooks)
- **Jest** (battle-tested testing framework)
- **Playwright** (reliable E2E testing)

## Japanese Medical Regulations Compliance

The system must comply with:
- **Electronic Medical Record 3 Principles**: Authenticity, Readability, Preservation
- **Medical Information System Security Guidelines v6.0**
- **Personal Information Protection Law**
- **ORCA integration** for insurance billing
- **SS-MIX2** standard for data exchange

## Development Guidelines

### Code Standards
- Follow Python PEP 8 style guidelines
- Use TypeScript strict mode for frontend
- Implement comprehensive error handling
- Maintain audit trails for all medical data operations
- Never commit sensitive medical information or API keys

### Security Requirements
- All medical data operations must be logged
- Implement role-based access control
- Use proper encryption for sensitive data
- Follow zero-trust security model principles

### Documentation
- Document all API endpoints with OpenAPI/Swagger
- Maintain up-to-date architecture diagrams
- Document compliance mappings to Japanese regulations
- Provide clear setup instructions for medical environments

## Quality Assurance and Testing Standards

### Mandatory Testing Protocol
**CRITICAL**: All development work MUST follow this testing protocol before deployment:

1. **Build Verification (Required)**
   ```bash
   # Frontend build verification
   npm run build
   # Must complete successfully with no TypeScript errors
   
   # Backend build verification
   uv run pytest
   # All tests must pass
   ```

2. **Code Quality Checks (Required)**
   ```bash
   # Frontend linting
   npm run lint
   # Must have zero errors, warnings acceptable
   
   # Type checking
   npm run type-check
   # Must pass with no type errors
   
   # Backend linting
   uv run ruff check .
   uv run mypy .
   # Must pass all checks
   ```

3. **Performance Testing (Required)**
   - Frontend pages must load in < 2 seconds
   - API responses must be < 500ms for standard queries
   - Database queries must be optimized (< 100ms for patient lookups)

4. **Security Validation (Required)**
   - All API endpoints must have proper authentication
   - Input validation on all forms
   - SQL injection prevention verified
   - XSS protection validated

### Development Workflow Requirements

**Before ANY commit or pull request:**

1. **Local Testing Suite**
   ```bash
   # Run full test suite
   npm run build && npm run lint && npm run type-check
   uv run pytest && uv run ruff check . && uv run mypy .
   ```

2. **Manual Verification**
   - Start development server and verify core functionality
   - Test at least 3 critical user flows (patient registration, medical record entry, prescription)
   - Verify responsive design on mobile and desktop
   - Check console for JavaScript errors

3. **Performance Benchmarks**
   - Dashboard load time: < 2 seconds
   - Patient search response: < 500ms
   - Form submission feedback: < 300ms

### Zero-Tolerance Standards

**The following issues will cause immediate rejection:**

1. **Build Failures**: Code that doesn't compile/build successfully
2. **Type Errors**: Any TypeScript compilation errors
3. **Critical Security Flaws**: Unvalidated inputs, exposed secrets, SQL injection risks
4. **Performance Regressions**: Pages loading > 3 seconds, API responses > 1 second
5. **Medical Data Integrity**: Any code that could corrupt patient records

### Testing Philosophy for Medical Systems

**Medical-Grade Reliability**:
- **99.9% Uptime Target**: System must be reliable for 24/7 healthcare operations
- **Data Integrity**: Zero tolerance for data corruption or loss
- **User Safety**: UI must prevent medical errors through validation and confirmation
- **Audit Compliance**: All actions must be logged and traceable
- **Performance Under Load**: System must handle 100+ concurrent users

**Testing Pyramid for Healthcare**:
1. **Unit Tests (70%)**: Every function that handles medical data
2. **Integration Tests (20%)**: API endpoints and database interactions  
3. **E2E Tests (10%)**: Critical clinical workflows
4. **Manual Testing**: Usability and clinical workflow validation

### Deployment Readiness Checklist

**Before any production deployment:**

- [ ] All automated tests passing (100%)
- [ ] Performance benchmarks met
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Medical workflow validation by clinical team
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured
- [ ] HIPAA compliance audit completed (for patient data)
- [ ] Documentation updated (API docs, user guides)

### Medical Emergency Protocol

**For critical production issues:**

1. **Immediate Response** (< 5 minutes)
   - Take affected systems offline if patient safety at risk
   - Notify medical staff of system status
   - Activate backup procedures

2. **Investigation and Fix** (< 30 minutes)
   - Identify root cause
   - Implement emergency patch
   - Test fix in staging environment

3. **Recovery and Post-Mortem** (< 2 hours)
   - Deploy verified fix to production
   - Verify all systems operational
   - Conduct post-mortem analysis
   - Update procedures to prevent recurrence

**Remember**: In medical systems, software reliability directly impacts patient care and safety.

## Development Principles for Long-Term Viability

### Medical-Grade Development Strategy
- **Stability First**: Proven technologies over cutting-edge for mission-critical features
- **Battle-Tested Libraries**: Choose libraries with extensive production healthcare usage
- **Modular Architecture**: Enable component replacement without system rewrites
- **API-First Design**: Decouple frontend and backend for technology flexibility
- **Comprehensive Testing**: Medical-grade reliability requires extensive test coverage

### Technology Selection Criteria
1. **Production Proven**: Must have extensive real-world medical system usage
2. **Stability**: Mature APIs with predictable upgrade paths
3. **Ecosystem**: Rich library ecosystem for rapid development
4. **Medical Compliance**: Built-in support for HIPAA, accessibility, audit trails
5. **Performance**: Sub-2-second response times for critical workflows
6. **Community**: Strong long-term community and enterprise support

### Version Management Protocol
- **Stable-First**: Use stable LTS versions for production deployments
- **Research Before Upgrade**: Thoroughly evaluate new versions before adoption
- **Security Priority**: Immediate security updates, planned feature updates
- **Backward Compatibility**: Maintain compatibility during technology evolution
- **Documentation**: Complete documentation of all technology decisions and rationales

### Medical System Technology Monitoring
- **Security-Focused Reviews**: Immediate evaluation of security patches and updates
- **Quarterly Stability Assessment**: Review system performance and stability metrics
- **Annual Technology Roadmap**: Conservative planning for major upgrades
- **Medical Community Engagement**: Participate in healthcare IT and regulatory discussions
- **Conservative Upgrade Approach**: Minimum 6-month evaluation period for major technology changes

### Code Quality and Error Checking Protocol

**MANDATORY: Always run linting and type-checking before any commit or deployment**

#### Frontend Quality Checks (Required)
```bash
# Type checking - MUST pass with zero errors
npm run type-check

# Linting - MUST pass with zero errors (warnings acceptable)
npm run lint

# Build verification - MUST complete successfully
npm run build
```

#### Development Workflow Standards
1. **Before Every Commit**: Run all quality checks
2. **Before Every Pull Request**: Ensure clean build and type-check
3. **Error Tolerance**: Zero TypeScript errors, ESLint warnings acceptable for unused type definitions
4. **Medical Safety**: Any error that could affect patient data or medical workflows must be fixed immediately

#### Common Error Patterns to Fix
- **Unused imports**: Remove all unused imports to keep code clean
- **Type safety**: Fix all TypeScript errors, especially optional chaining issues
- **Missing type annotations**: Add proper type annotations for function parameters and return values
- **Incorrect type usage**: Use `typeof EnumName[keyof typeof EnumName]` for enum value types

#### When to Use Quality Checks
- **During active development**: Check frequently while coding
- **Before breaks**: Always run checks before stepping away from code
- **After major changes**: Full quality check after significant refactoring
- **Pre-deployment**: Complete verification before any production deployment

**Remember**: In medical systems, code quality directly impacts patient safety. Never skip quality checks.

## Project Vision and Philosophy

### Open Source Innovation
- **Community-Driven**: GitHub-centered collaborative development
- **Developer-Friendly**: Easy to understand, modify, and extend
- **Transparency**: Open decision-making and development processes
- **Knowledge Sharing**: Complete documentation and educational resources

### AI-Assisted Development Environment
- **Local LLM Integration**: Ollama for on-premise AI assistance
- **Vibe Coding**: LLM-supported autonomous development workflows
- **Sandbox Environment**: Safe testing ground for experimental features
- **Continuous Learning**: AI learns from development patterns and medical workflows

### Healthcare Innovation Platform
- **Research Collaboration**: Academic and industry partnership framework
- **Innovation Labs**: Experimental feature development environment
- **Global Health Impact**: Contributing to worldwide healthcare improvement
- **Sustainability**: Environmentally conscious development practices

## Development Philosophy

### Test-Driven Excellence
- **Comprehensive Testing**: 85%+ code coverage target across all phases
- **Medical Safety**: Every function thoroughly tested before progression
- **Performance Validation**: Response time and scalability benchmarks
- **Compliance Verification**: Regulatory adherence at every step

### Modular Architecture
- **Microservices Design**: Independent, scalable service components
- **Plugin System**: Extensible architecture for custom functionality
- **Standard Compliance**: FHIR, SS-MIX2, and international standards
- **Legacy Integration**: Seamless connection with existing systems

### Local-First Approach
- **On-Premise Deployment**: Complete local control of medical data
- **Offline Resilience**: Disaster-resistant operation capabilities
- **Privacy by Design**: Data never leaves the local environment
- **Edge Computing**: Local processing for performance and privacy

## Backend Architecture Decisions

### SQLModel Integration (2025)
**Decision**: Migrated from traditional SQLAlchemy to SQLModel for unified data layer

**Rationale**:
- **Single Source of Truth**: SQLModel combines Pydantic schemas and SQLAlchemy models
- **Type Safety**: Full TypeScript-style type hints with Python 3.11+
- **FastAPI Native**: Created by tiangolo (FastAPI author) for perfect integration
- **Developer Experience**: Reduces code duplication and improves maintainability
- **Medical Data Integrity**: Enhanced validation and serialization for patient data

**Implementation**:
```python
# Traditional approach (replaced)
class Patient(Base):          # SQLAlchemy model
class PatientCreate(BaseModel):  # Pydantic schema
class PatientResponse(BaseModel): # Another schema

# SQLModel approach (current)
class PatientBase(SQLModel):     # Shared base
class Patient(PatientBase, table=True):  # Database model
class PatientCreate(PatientBase):        # Input schema
class PatientResponse(PatientBase):      # Output schema
```

**Benefits**:
- 60% reduction in schema-related code
- Zero serialization bugs between API and database
- Automatic OpenAPI documentation generation
- Enhanced IDE support with proper type hints

## Frontend Design System

### Apple-Inspired Liquid Glass UI
**Decision**: Implemented sophisticated design system combining Apple HIG with Liquid Glass aesthetics

**Design Philosophy**:
- **Medical-First UX**: Every interaction optimized for healthcare workflows
- **Elegant Simplicity**: Clean, uncluttered interfaces that reduce cognitive load  
- **iPhone-like Fluidity**: Smooth animations and responsive interactions
- **Professional Aesthetics**: Sophisticated visual hierarchy without SaaS clutter

**Key Components**:
- **Glass Morphism Cards**: Backdrop blur with subtle transparency
- **Apple Color System**: Primary blue (#007AFF), system grays, medical status colors
- **Fluid Animations**: Spring physics and Apple-timing curves
- **Medical Components**: PatientCard, VitalCard, StatusBadge with clinical context

**Technical Implementation**:
```typescript
// Glass effect with backdrop blur
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

// Smooth interactions with spring physics
const buttonAnimation = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};
```

**Performance Standards**:
- Initial load: < 2 seconds
- Page transitions: < 300ms
- Form interactions: < 100ms response time
- Search results: < 500ms

**Documentation**: See `/docs/architecture/design-system.md` for complete specifications

## Important Notes

- This is a medical system requiring strict compliance with Japanese healthcare regulations
- All changes to patient data handling must consider legal requirements
- Performance is critical (target: <2 seconds response time)
- System must support offline operation for disaster scenarios
- Multi-language support (Japanese primary, English secondary) is required
- **Innovation Focus**: This project serves as a sandbox for testing cutting-edge medical AI
- **Community Impact**: Designed to advance open-source healthcare technology globally

## Development Phases Overview

The project follows a 6-phase development approach, with each phase building robust, tested functionality:

1. **Phase 1 (4-6 weeks)**: Foundation & PoC - Docker environment, core MVP, local LLM integration
2. **Phase 2 (6-8 weeks)**: Core Functionality - Prescription management, test orders, enhanced AI
3. **Phase 3 (8-10 weeks)**: Security & Multi-user - Authentication, audit logs, ORCA preparation
4. **Phase 4 (10-12 weeks)**: ORCA Integration - Complete Japanese billing system integration
5. **Phase 5 (12-14 weeks)**: Standards & AI - FHIR, SS-MIX2, advanced clinical AI
6. **Phase 6 (16-20 weeks)**: Innovation Lab - Research platform, quantum computing, global health

## Next Steps for Development

1. **Environment Setup**: Create Docker-compose development environment
2. **Foundation Architecture**: Establish FastAPI + Next.js + PostgreSQL stack
3. **Local LLM Integration**: Set up Ollama for development assistance
4. **Testing Framework**: Implement comprehensive testing from day one
5. **Community Setup**: Prepare contribution guidelines and documentation