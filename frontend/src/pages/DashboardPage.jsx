import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Badge from '../components/Badge'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { PageLoader } from '../components/Spinner'
import { getDashboard } from '../services/dashboardService'
import { getErrorMessage } from '../utils/getErrorMessage'

function StatCard({ label, value, caption, icon, color, index, reduceMotion }) {
  return <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : index * 0.07, ease: 'easeOut' }}><Card className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{caption}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${color}`}>{icon}</span></div></Card></motion.div>
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    getDashboard().then((response) => setDashboard(response.dashboard)).catch((requestError) => setError(getErrorMessage(requestError)))
  }, [])

  if (!dashboard && !error) return <PageLoader />

  return (
    <div>
      <PageHeader eyebrow="Your command center" title="Good to see you." description="Keep your daily practice deliberate, visible, and moving forward." />
      {error ? <EmptyState title="Dashboard unavailable" description={error} /> : <>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Current streak" value={`${dashboard.currentStreak} days`} caption="Consecutive days with a solved problem" icon="↗" color="bg-violet-50 text-violet-700" index={0} reduceMotion={reduceMotion} />
          <StatCard label="Today's goal" value={`${dashboard.todaysGoal.solved}/${dashboard.todaysGoal.target}`} caption={`${dashboard.todaysGoal.remaining} problems remaining`} icon="◎" color="bg-emerald-50 text-emerald-700" index={1} reduceMotion={reduceMotion} />
          <StatCard label="Revision queue" value={dashboard.revisionCount} caption="Topics ready to revisit" icon="◌" color="bg-amber-50 text-amber-700" index={2} reduceMotion={reduceMotion} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold tracking-tight text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">Small wins compound.</p></div><Badge tone="violet">Live progress</Badge></div><div className="mt-5 space-y-1">{dashboard.recentActivity.length ? dashboard.recentActivity.map((activity, index) => <div key={`${activity.title}-${index}`} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-700">{activity.type === 'problem-solved' ? '✓' : '◌'}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{activity.title}</p><p className="text-xs text-slate-400">{activity.type === 'problem-solved' ? `Solved${activity.topic ? ` in ${activity.topic}` : ''}` : `Topic is ${activity.progress}`}</p></div><time className="text-xs text-slate-400">{new Date(activity.occurredAt).toLocaleDateString()}</time></div>) : <p className="py-8 text-center text-sm text-slate-500">Your activity will appear here after your first update.</p>}</div></Card>
          <Card className="p-5 sm:p-6"><h2 className="font-bold tracking-tight text-slate-900">Upcoming tasks</h2><p className="mt-1 text-sm text-slate-500">Your dated roadmap tasks for the next seven days.</p><div className="mt-5 space-y-3">{dashboard.upcomingTasks.length ? dashboard.upcomingTasks.map((task) => <div key={task._id} className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700">{task.title}</p><Badge tone="amber">{task.type}</Badge></div><p className="mt-1 text-xs text-slate-500">{task.roadmap} · Due {new Date(task.targetDate).toLocaleDateString()}</p></div>) : <p className="py-8 text-center text-sm text-slate-500">No roadmap tasks due in the next 7 days.</p>}</div></Card>
        </div>
      </>}
    </div>
  )
}
