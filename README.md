# 🚀 Enterprise Workflow Copilot - **Browser Extension**


An AI-powered workflow automation platform with a Chrome extension for capturing and managing business processes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow)

---

## ✨ Features

### 🔌 Chrome Extension
- **Record Workflows**: Capture clicks, inputs, and navigation as you work
- **AI Generation**: Describe a task and let AI create the workflow steps
- **One-Click Save**: Instantly save workflows to your dashboard

### 📊 Dashboard
- **Workflow Management**: Create, edit, and organize workflows
- **Step-by-Step Viewer**: View detailed workflow steps with screenshots
- **Organizations**: Create teams and share workflows
- **Activity Tracking**: Monitor workflow usage and changes
- **User Settings**: Customize your profile and preferences

### 🤖 AI-Powered
- **Natural Language Input**: Describe workflows in plain English
- **Smart Step Generation**: AI creates detailed, actionable steps
- **Workflow Optimization**: Suggestions for improving processes

---

## 🎯 Use Cases

| Industry | Example Workflows |
|----------|-------------------|
| **HR** | Employee onboarding, leave requests, performance reviews |
| **Sales** | Lead qualification, proposal creation, CRM updates |
| **Finance** | Invoice processing, expense reports, budget approvals |
| **IT** | Ticket handling, deployment processes, user provisioning |
| **Marketing** | Campaign launch, content approval, analytics reporting |

---

## 🔌 Chrome Extension Setup

### Installation

1. **Configure credentials** - Copy the example config:
   ```bash
   cd extension
   cp config.example.js config.js
   ```

2. **Edit `config.js`** with your settings:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: 'https://your-project.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-key-here',
     API_BASE_URL: 'http://localhost:8000/api/v1',  // or your deployed backend
     DASHBOARD_URL: 'http://localhost:3000'         // or your deployed frontend
   };
   ```

3. **Load in Chrome**:
   - Navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle top-right)
   - Click **Load unpacked** → Select the `extension` folder

### Using the Extension

| Mode | How to Use |
|------|------------|
| **Selection Mode** | Highlight text on any page → Generate workflow from selection |
| **Full Page** | Extract all content (emails, forms, tables) → Generate workflow |
| **AI Generate** | Describe your workflow in plain English → AI creates steps |

Once saved, workflows appear in your dashboard under the selected organization.

---

## 📖 How to Use

### Creating a Workflow (Manual)
1. Go to Dashboard → **New Workflow**
2. Enter workflow name and description
3. Add steps one by one
4. Save the workflow

### Creating a Workflow (AI-Powered)
1. Click the Chrome extension icon
2. Select **AI Generate**
3. Describe your workflow in plain English
4. Review and save the generated steps

### Recording a Workflow
1. Click the Chrome extension icon
2. Select **Start Recording**
3. Perform the actions you want to capture
4. Click **Stop Recording**
5. Review and save

### Managing Workflows
- **View**: Click any workflow to see its steps
- **Edit**: Modify steps, descriptions, or status
- **Delete**: Remove workflows you no longer need
- **Filter**: Search by name or status

---

## 🏢 Multi-Tenancy & Data Isolation

The platform uses **organization-based data isolation**:

| Concept | Behavior |
|---------|----------|
| **Organizations** | Users create or join organizations (teams/companies) |
| **Workflows** | Belong to an organization, visible to all org members |
| **User Roles** | Members can have different roles (admin, member) within an org |
| **Activity Tracking** | All actions are logged with user attribution |

> **Note**: Users in the **same organization** see the **same workflows**. Users in **different organizations** have completely separate data.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, Pydantic |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini API |
| Extension | Chrome Extension API, JavaScript |

---

## 📁 Project Structure

```
enterprise-workflow-copilot/
├── frontend/          # Next.js web application
├── backend/           # FastAPI server
├── extension/         # Chrome extension
└── README.md
```
---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

---


