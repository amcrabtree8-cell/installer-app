'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'


type JobType = 'Install' | 'Sales Call' | ''

type JobStatus = 'Open' | 'Needs Return' | 'Completed'
type JobFilter = 'All' | JobStatus

type Installer = {
  name: string
  phone: string
  email: string
}

type Job = {
  id: string
  name: string
  phone: string
  company: string
  installer: string
  jobType: JobType
  status: JobStatus
  jobName: string
  jobDate: string
  timeWindow: string
  created_at?: string
}

type Activity = {
  id: string
  created_at: string
  job_id: string
  job_name: string
  customer_name: string
  installer: string
  action_type: string
  note: string
}
 
const companies = ['Intellihome', 'Crabtree Custom Electric, LLC']

const installers: Installer[] = [
  { name: 'Chip', phone: '6155092238', email: 'chip@cometotheexperts.com' },
  { name: 'Cody', phone: '6155168929', email: 'cody@cometotheexperts.com' },
  { name: 'Colby', phone: '2035597161', email: 'colby@cometotheexperts.com' },
  { name: 'Darrius', phone: '6155782432', email: 'darrius@cometotheexperts.com' },
  { name: 'Jordan', phone: '6153490114', email: 'jordan@cometotheexperts.com' },
  { name: 'Logan', phone: '9316754574', email: 'logan@cometotheexperts.com' },
  { name: 'Malachi', phone: '6163182882', email: 'malachiawalkes@gmail.com' },
  { name: 'Tanner', phone: '6153353337', email: 'tanner@cometotheexperts.com' },
]

export default function Home() { 
    const router = useRouter()
  const [view, setView] = useState<'add' | 'jobs' | 'myJobs' | 'dashboard'>('add')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const [company, setCompany] = useState('')
  const [installer, setInstaller] = useState('')
  const [jobType, setJobType] = useState<JobType>('')

  const [jobName, setJobName] = useState('')

  const [activity, setActivity] = useState<Activity[]>([])

  const [jobDate, setJobDate] = useState('')
  const [timeWindow, setTimeWindow] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [jobs, setJobs] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<JobFilter>('All')

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  const ownerPhone = '6153101346'

  const installersWithJobType = ['Chip', 'Cody', 'Tanner']
  const salesOnlyInstallers: string[] = []

  const showJobType = installersWithJobType.includes(installer)
  const isSalesOnly = salesOnlyInstallers.includes(installer)

  const cleanPhone = (value: string) => value.replace(/\D/g, '')

  const formatPhone = (value: string) => {
    const digits = cleanPhone(value).slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const isValidPhone = (value: string) => cleanPhone(value).length === 10

  const getInstallerPhone = (name: string) =>
    installers.find((i) => i.name === name)?.phone || ''

  const logActivity = async (
  job: Job,
  actionType: string,
  note: string
) => {
  const { error } = await supabase.from('job_activity').insert({
    job_id: job.id,
    job_name: job.jobName || '',
    customer_name: job.name || '',
    installer: job.installer || '',
    action_type: actionType,
    note,
  })

  if (error) {
    alert('Activity did not save: ' + error.message)
    console.error('Failed to log activity:', error)
    return
  }

  alert('Activity saved')
  fetchActivity()
}

  const openSms = (to: string, message: string) => {
  const cleaned = cleanPhone(to)
  if (!cleaned) return
  window.location.href = `sms:${cleaned}?body=${encodeURIComponent(message)}`
}
const openJobSms = async (
  job: Job,
  message: string,
  actionType: string
) => {
  const cleaned = cleanPhone(job.phone)
  if (!cleaned) return

  await logActivity(
    job,
    actionType,
    `${job.installer} sent ${actionType} to ${job.name}`
  )

  window.location.href = `sms:${cleaned}?body=${encodeURIComponent(message)}`
}

  const openCall = (to: string) => {
    const cleaned = cleanPhone(to)
    if (!cleaned) return
    window.location.href = `tel:${cleaned}`
  }

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load jobs', error)
      return
    }

    setJobs((data as Job[]) || [])
  }

  const fetchActivity = async () => {
    const { data, error } = await supabase
      .from('job_activity')
      .select('*')
      .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load activity:', error)
    return
  }

  setActivity((data as Activity[]) || [])
}

useEffect(() => {
  const checkLogin = async () => {
    const { data } = await supabase.auth.getSession()

if (!data.session) {
  router.push('/login')
  return
}

setCurrentUserEmail(data.session.user.email ?? null)

fetchJobs()
fetchActivity()
  }

  checkLogin()
}, [router])

  useEffect(() => {
    if (isSalesOnly) {
      setJobType('Sales Call')
    } else if (!showJobType) {
      setJobType('')
    }
  }, [installer, isSalesOnly, showJobType])

  const clearForm = () => {
    setCompany('')
    setInstaller('')
    setJobType('')
    setName('')
    setJobName('')
    setTimeWindow('')
    setJobDate('')
    setPhone('')
    setEditingId(null)
  }

  const loadJobForEdit = (job: Job) => {
    setCompany(job.company)
    setInstaller(job.installer)
    setJobType(job.jobType)
    setName(job.name)
    setPhone(job.phone)
    setEditingId(job.id)
    setSelectedJob(null)
    setView('add')
  }

  const updateJobStatus = async (id: string, status: JobStatus) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Failed to update status', error)
      alert(`Could not update job status: ${error.message}`)
      return
    }

    await fetchJobs()

    if (selectedJob?.id === id) {
      setSelectedJob((current) => (current ? { ...current, status } : current))
    }
  }

  const saveJob = async () => {
    if (!company || !installer || !name.trim() || !phone.trim()) {
      alert('Fill all required fields')
      return
    }

    if (!isValidPhone(phone)) {
      alert('Enter a valid 10-digit phone number')
      return
    }

    if (showJobType && !jobType) {
      alert('Select a job type')
      return
    }

    const existingJob = jobs.find((job) => job.id === editingId)

    const newJob = {
      name: name.trim(),
      phone,
      jobName,
      jobDate,
      timeWindow,
      company,
      installer,
      jobType: isSalesOnly ? 'Sales Call' : jobType,
      status: (existingJob?.status || 'Open') as JobStatus,
    }

    if (editingId) {
      const { error } = await supabase
        .from('jobs')
        .update(newJob)
        .eq('id', editingId)

      if (error) {
        console.error('Failed to update job', error)
        alert(`Could not update job: ${error.message}`)
        return
      }
    } else {
      const { error } = await supabase.from('jobs').insert([newJob])

      if (error) {
        console.error('Failed to save job', error)
        alert(`Could not save job: ${error.message}`)
        return
      }
    }

    await fetchJobs()

    const installerPhone = getInstallerPhone(installer)

    if (!editingId && installerPhone) {
      openSms(
        installerPhone,
        `New job assigned:
Customer: ${newJob.name}
Phone: ${newJob.phone}
Company: ${newJob.company}
Installer: ${newJob.installer}
Job Type: ${newJob.jobType || 'General'}`
      )
    }

    clearForm()
    setView('jobs')
  }

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete job', error)
      alert(`Could not delete job: ${error.message}`)
      return
    }

    await fetchJobs()

    if (selectedJob?.id === id) {
      setSelectedJob(null)
    }
  }

  const textOnMyWay = () => {
    if (!selectedJob) return

    const message =
      selectedJob.jobType === 'Sales Call'
        ? `Hello, this is ${selectedJob.installer} from ${selectedJob.company}. I'm on my way for our appointment.`
        : `Hello, this is ${selectedJob.installer} from ${selectedJob.company}. I'm on my way!`

    openJobSms(selectedJob, message, 'On My Way Text')
  }

  const callCustomer = () => {
    if (!selectedJob) return
    openCall(selectedJob.phone)
  }

  const sendThankYou = () => {
    if (!selectedJob) return

    const message =
      selectedJob.jobType === 'Sales Call'
        ? `Hello, thank you for taking the time to meet with me today. I really enjoyed learning more about your project and helping find the best solution for your home. If any questions come up, I'm here to help. I'd love the opportunity to earn your business.`
        : `Hello, thank you for choosing us. We truly appreciate your business and hope you feel great about the work completed for you. It means a lot to us to be trusted with your project, and if you ever need anything in the future, we'd be glad to help.`

    openJobSms(selectedJob, message, 'Thank You Text')
  }

  const askForReview = () => {
    if (!selectedJob) return

    const reviewLinks: Record<string, string> = {
      Intellihome: 'https://g.page/r/Cfa0Ouenna50EBM/review',
      'Crabtree Custom Electric, LLC':
        'https://g.page/r/CTJGBytOBuuyEBM/review',
    }

    const reviewLink = reviewLinks[selectedJob.company] || ''

    const message = `Hello, thank you again for trusting us with your project. If you were happy with your experience, we'd really appreciate a quick review: ${reviewLink}`

    openJobSms(selectedJob, message, 'Review Request')
  }

  const returnNeeded = async () => {
    if (!selectedJob) return

    await updateJobStatus(selectedJob.id, 'Needs Return')

    openSms(
      ownerPhone,
      `RETURN NEEDED
Installer: ${selectedJob.installer}
Customer: ${selectedJob.name}
Phone: ${selectedJob.phone}
Company: ${selectedJob.company}
${selectedJob.jobType ? `Job Type: ${selectedJob.jobType}` : ''}`
    )
  }

  const jobComplete = async () => {
    if (!selectedJob) return

    await updateJobStatus(selectedJob.id, 'Completed')

    openSms(
      ownerPhone,
      `JOB COMPLETE
Installer: ${selectedJob.installer}
Customer: ${selectedJob.name}
Type: ${selectedJob.jobType || 'General'}`
    )
  }

const currentInstaller = installers.find(
  (installer) =>
    installer.email.trim().toLowerCase() === currentUserEmail?.trim().toLowerCase()
)

const filteredJobs = useMemo(() => {
  const baseJobs =
    view === 'myJobs'
      ? jobs.filter(
          (job) =>
            job.installer?.trim().toLowerCase() ===
            currentInstaller?.name.trim().toLowerCase()
        )
      : jobs

  if (statusFilter === 'All') return baseJobs

  return baseJobs.filter((job) => job.status === statusFilter)
}, [jobs, statusFilter, view, currentInstaller])

  const getStatusStyle = (status: JobStatus) => {
    switch (status) {
      case 'Needs Return':
        return {
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffe69c',
        }
      case 'Completed':
        return {
          background: '#d1e7dd',
          color: '#0f5132',
          border: '1px solid #badbcc',
        }
      default:
        return {
          background: '#e2e3e5',
          color: '#41464b',
          border: '1px solid #d3d6d8',
        }
    }
  }

  const filterButtonStyle = (filter: JobFilter) => ({
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid #ccc',
    background: statusFilter === filter ? '#111' : '#fff',
    color: statusFilter === filter ? '#fff' : '#111',
    fontWeight: 600,
    cursor: 'pointer' as const,
  })

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 500,
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Installer App</h1>

      <p>Logged in as: {currentUserEmail}</p>
      <p>Matched installer: {currentInstaller?.name || 'No match'}</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => {
            setSelectedJob(null)
            setView('add')
          }}
        >
          Add Job
        </button>
        <button
          onClick={() => {
            setSelectedJob(null)
            setView('jobs')
          }}
        >
          View Jobs
        </button>
        <button onClick={() => setView('myJobs')}>My Jobs</button>

        <button onClick={() => setView('dashboard')}>Dashboard</button>
      </div>
      
      {view === 'dashboard' && (
  <section>
    <h2>Dashboard Activity</h2>

    {activity.length === 0 ? (
      <p>No activity yet.</p>
    ) : (
      activity.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <strong>{item.action_type}</strong>

          <div>{item.note}</div>

          <div>Job: {item.job_name || 'No job name'}</div>
          <div>Customer: {item.customer_name}</div>
          <div>Installer: {item.installer}</div>

          <div>
            Time:{' '}
            {item.created_at
              ? new Date(item.created_at).toLocaleString()
              : 'No time'}
          </div>
        </div>
      ))
    )}
  </section>
)}

      {view === 'add' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            <option value="">Select Company</option>
            {companies.map((companyName) => (
              <option key={companyName} value={companyName}>
                {companyName}
              </option>
            ))}
          </select>

          <select
            value={installer}
            onChange={(e) => {
              const selectedInstaller = e.target.value
              setInstaller(selectedInstaller)
              if (!installersWithJobType.includes(selectedInstaller)) {
                setJobType('')
              }
            }}
          >
            <option value="">Select Installer</option>
            {installers.map((person) => (
              <option key={person.name} value={person.name}>
                {person.name}
              </option>
            ))}
          </select>

          {showJobType && (
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
            >
              <option value="">Select Job Type</option>
              <option value="Install">Install</option>
              <option value="Sales Call">Sales Call</option>
            </select>
          )}
          <input
            type="date"
            value={jobDate}
            onChange={(e) => setJobDate(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
          <input
            placeholder="Time Window"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
           <input
              placeholder="Job Name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />
          <input
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveJob}>
              {editingId ? 'Update Job' : 'Save Job'}
            </button>
            {editingId && <button onClick={clearForm}>Cancel Edit</button>}
          </div>
        </div>
      )}

      {(view === 'jobs' || view === 'myJobs') && !selectedJob && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              style={filterButtonStyle('All')}
              onClick={() => setStatusFilter('All')}
            >
              All ({jobs.length})
            </button>
            <button
              style={filterButtonStyle('Open')}
              onClick={() => setStatusFilter('Open')}
            >
              Open ({jobs.filter((job) => job.status === 'Open').length})
            </button>
            <button
              style={filterButtonStyle('Needs Return')}
              onClick={() => setStatusFilter('Needs Return')}
            >
              Needs Return ({jobs.filter((job) => job.status === 'Needs Return').length})
            </button>
            <button
              style={filterButtonStyle('Completed')}
              onClick={() => setStatusFilter('Completed')}
            >
              Completed ({jobs.filter((job) => job.status === 'Completed').length})
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <p>No jobs in this filter.</p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12,
                  background: 'white',
                }}
              >
                <div
                  onClick={() => setSelectedJob(job)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <strong>{job.jobName || job.name}</strong>
                    <div>Customer: {job.name}</div>
                    <div>
                        Date:{' '}
                        {job.jobDate
                          ? new Date(job.jobDate + 'T00:00:00').toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: '2-digit',
                            })
                          : 'No date selected'}
                      </div>
                    <div>Time Window: {job.timeWindow || 'No time window selected'}</div>
                    <span
                      style={{
                        ...getStatusStyle(job.status),
                        padding: '4px 8px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
                    {job.company} • {job.installer}
                    {job.jobType ? ` • ${job.jobType}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => loadJobForEdit(job)}>Edit</button>
                  <button onClick={() => deleteJob(job.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedJob && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button onClick={() => setSelectedJob(null)}>Back</button>

          <h2 style={{ marginBottom: 0 }}>{selectedJob.name}</h2>
          <p style={{ margin: 0 }}>{selectedJob.phone}</p>
          <p style={{ margin: 0 }}>
            {selectedJob.company} • {selectedJob.installer}
            {selectedJob.jobType ? ` • ${selectedJob.jobType}` : ''}
          </p>

          <div>
            <span
              style={{
                ...getStatusStyle(selectedJob.status),
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-block',
                marginTop: 4,
              }}
            >
              {selectedJob.status}
            </span>
          </div>

          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <button onClick={textOnMyWay}>On My Way</button>
            <button onClick={callCustomer}>Call</button>
            <button onClick={sendThankYou}>Thank You</button>

            {selectedJob.jobType !== 'Sales Call' && (
              <button onClick={askForReview}>Ask Review</button>
            )}

            <button onClick={returnNeeded}>Return Needed</button>
            <button onClick={jobComplete}>Job Complete</button>
            <button onClick={() => loadJobForEdit(selectedJob)}>Edit Job</button>
            <button onClick={() => deleteJob(selectedJob.id)}>Delete Job</button>
          </div>
        </div>
      )}
    </main>
  )
}
 
