'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import PageTransition from '@/components/layout/PageTransition';
import CommandPalette from '@/components/layout/CommandPalette';
import FloatingActionBtn from '@/components/layout/FloatingActionBtn';
import StudyTimer from '@/components/layout/StudyTimer';
import AchievementToast, { useAchievement } from '@/components/achievements/AchievementToast';
import '@/styles/dashboard.css';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { current, close } = useAchievement();

  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="db-main-area relative">
        <Topbar />

        {/* Global Features */}
        <CommandPalette />
        <StudyTimer />
        <AchievementToast achievement={current} onClose={close} />
        <FloatingActionBtn />

        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
