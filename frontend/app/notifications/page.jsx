'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, getUser } from '@/lib/auth'
import { notificationsAPI } from '@/lib/api'

export default function NotificationsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (!user) {
      router.push('/login')
      return
    }
    loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    if (mounted) {
      const user = getUser()
      if (!user) {
        router.push('/login')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const loadNotifications = async () => {
    const token = getAuthToken()
    if (!token) {
      setError('Please log in to view notifications.')
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await notificationsAPI.getAll()
      let allNotifications = (response.data.notifications || []).map((n) => ({
        ...n,
        read: n.read ?? n.isRead ?? false,
      }))
      
      // Apply filter
      if (filter === 'unread') {
        allNotifications = allNotifications.filter(n => !n.read)
      } else if (filter === 'read') {
        allNotifications = allNotifications.filter(n => n.read)
      }
      
      // Sort by date (newest first)
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setNotifications(allNotifications)
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Your session expired. Please log in again to view notifications.')
        router.push('/login')
      } else if (error.response?.status === 404) {
        setError('Notifications service is unavailable right now.')
      } else {
        setError('Unable to load notifications. Please try again shortly.')
      }
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      loadNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setError('Could not update notification status. Please retry.')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      loadNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
      setError('Could not mark all notifications as read. Please try again.')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId)
      loadNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
      if (error.response?.status === 401) {
        setError('Your session expired. Please log in again to manage notifications.')
        router.push('/login')
      } else {
        setError('Could not delete the notification. Please try again.')
      }
    }
  }

  const formatDate = (date) => {
    if (!date || !mounted) return ''
    try {
      const now = new Date()
      const notifDate = new Date(date)
      const diffMs = now - notifDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return notifDate.toLocaleDateString('en-CA')
    } catch {
      return ''
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'offer':
        return '💰'
      case 'offer_accepted':
        return '✅'
      case 'offer_rejected':
        return '❌'
      case 'property':
        return '🏠'
      case 'message':
        return '💬'
      default:
        return '🔔'
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: 'Read' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              filter === f.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-4 text-lg">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">No notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
                !notification.read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.message}
                    </h3>
                    {!notification.read && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(notification.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

