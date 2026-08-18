import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Projects',
      value: '3',
      description: 'Collaborative workspaces',
      icon: FolderKanban,
      color: 'text-sky-500 bg-sky-500/10',
    },
    {
      title: 'Pending Tasks',
      value: '12',
      description: 'Tasks across all projects',
      icon: CheckSquare,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Project Notes',
      value: '8',
      description: 'Shared documentation',
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Team Members',
      value: '6',
      description: 'Collaborators',
      icon: Users,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.username || 'Student'}! 👋
            </h1>
            <Badge variant="success" className="text-[10px]">Active Session</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Here's an overview of your collaborative student projects and task progress.
          </p>
        </div>

        <Link to={ROUTES.PROJECT_NEW}>
          <Button size="sm" className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Projects Card */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Workspaces</CardTitle>
              <CardDescription className="text-xs">Your active collaborative team projects</CardDescription>
            </div>
            <Link to={ROUTES.PROJECTS}>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl border border-border/60 bg-card/50 flex items-center justify-between hover:bg-accent/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Web Dev Capstone Project</h4>
                  <p className="text-[11px] text-muted-foreground">Full-stack React & Node collaboration</p>
                </div>
              </div>
              <Badge variant="info">Admin</Badge>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/50 flex items-center justify-between hover:bg-accent/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Database Systems Lab</h4>
                  <p className="text-[11px] text-muted-foreground">MongoDB schema & indexing design</p>
                </div>
              </div>
              <Badge variant="secondary">Member</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Quick Shortcuts */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            <CardDescription className="text-xs">Access primary workspace tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={ROUTES.PROJECTS} className="block">
              <div className="p-3 rounded-xl border border-border/50 bg-accent/30 hover:bg-accent/70 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Browse Projects</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </Link>

            <Link to={ROUTES.ACCOUNT} className="block">
              <div className="p-3 rounded-xl border border-border/50 bg-accent/30 hover:bg-accent/70 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground">Account & Security</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
