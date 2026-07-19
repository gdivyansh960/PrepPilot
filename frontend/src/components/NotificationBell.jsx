import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useToast } from '../hooks/useToast'
import * as notificationService from '../services/notificationService'
import { getErrorMessage } from '../utils/getErrorMessage'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const reduceMotion = useReducedMotion()
  const { showToast } = useToast()
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationService.getNotifications()
      setNotifications(response.notifications)
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadNotifications() }, [])

  const openPanel = () => {
    setOpen((current) => !current)
    if (!open) loadNotifications()
  }

  const markRead = async (notification) => {
    if (notification.read) return
    try {
      const response = await notificationService.markNotificationRead(notification._id)
      setNotifications((current) => current.map((item) => item._id === notification._id ? response.notification : item))
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead()
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={openPanel} className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Open notifications" aria-expanded={open}>
        <span className="text-base">♢</span>
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 h-4 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && <motion.div initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="text-sm font-bold text-slate-900">Notifications</p><p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} unread` : 'All caught up'}</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-violet-600 hover:text-violet-700">Mark all read</button>}</div>
          <div className="max-h-80 overflow-y-auto p-2">{loading ? <p className="px-3 py-7 text-center text-sm text-slate-500">Loading notifications…</p> : notifications.length ? notifications.map((notification) => <button type="button" key={notification._id} onClick={() => markRead(notification)} className={`w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 ${notification.read ? 'opacity-65' : 'bg-violet-50/60'}`}><div className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-violet-600'}`} /><div><p className="text-sm font-semibold text-slate-700">{notification.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleDateString()}</p></div></div></button>) : <p className="px-3 py-7 text-center text-sm text-slate-500">No notifications yet.</p>}</div>
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}
