'use client'

import { useEffect, useMemo, useState } from 'react'

type JobType = 'Install' | 'Sales Call' | ''

type JobStatus = 'Open' | 'Needs Return' | 'Completed'
type JobFilter = 'All' | JobStatus

type Installer = {
  name: string
  phone: string
}

type Job = {
  id: string
  name: string
  phone: string
  company: string
  installer: string
  jobType: JobType
  status: JobStatus
}

const companies = ['Intellihome', 'Crabtree Custom Electric, LLC']

const installers: Installer[] = [
  { name: 'Chip', phone: '6155092238' },
  { name: 'Cody', phone: '6155168929' },
  { name: 'Colby', phone: '2035597161' },
  { name: 'Darrius', phone: '6155782432' },
  { name: 'Jordan', phone: '6153490114' },
  { name: 'Logan', phone: '9316754574' },
  { name: 'Malachi', phone: '6163182882' },
  { name: 'Tanner', phone: '6153353337' },
]

export default function Home() {
  const [view, setView] = useState<'add' | 'jobs'>('add')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const [company, setCompany] = useState('')
  const [installer, setInstaller] = useState('')
  const [jobType, setJobType] = useState<JobType>('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [jobs, setJobs] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<JobFilter>('All')

  const ownerPhone = '6153101346'

  const installersWithJobType = ['Chip', 'Cody', 'Tanner']
  const salesOnlyInstallers: string[] = []

  const showJobType = installersWithJobType.includes(installer)
  const isSalesOnly = salesOnlyInstallers.includes(installer)

  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs')
    if (savedJobs) {
      try {
        const parsed = JSON.parse(savedJobs)
        if (Array.isArray(parsed)) {
          setJobs(parsed)
        }
      } catch (error) {
        console.error('Failed to load jobs', error)
      }
    }
  }, [])

  useEffect(() => {
    if (isSalesOnly) {
      setJobType('Sales Call')
    } else if (!showJobType) {
      setJobType('')
    }
  }, [installer, isSalesOnly, showJobType])

  const cleanPhone = (value: string) => value.replace(/\D/g, '')

  const formatPhone = (value: string) => {
    const digits = cleanPhone(value).slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const isValidPhone = (value: string) => cleanPhone(value).length === 10

  const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const getInstallerPhone = (name: string) =>
    installers.find((i) => i.name === name)?.phone || ''

  const openSms = (to: string, message: string) => {
    const phone = cleanPhone(to)
    if (!phone) return
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`
  }

  const openCall = (to: string) => {
    const phone = cleanPhone(to)
    if (!phone) return
    window.location.href = `tel:${phone}`
  }

  const saveJobs = (updated: Job[]) => {
    setJobs(updated)
    localStorage.setItem('jobs', JSON.stringify(updated))
  }

  const clearForm = () => {
    setCompany('')
    setInstaller('')
    setJobType('')
    setName('')
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

  const updateJobStatus = (id: string, status: JobStatus) => {
    const updated = jobs.map((job) =>
      job.id === id ? { ...job, status } : job
    )
    saveJobs(updated)

    if (selectedJob?.id === id) {
      const updatedSelected = updated.find((job) => job.id === id) || null
      setSelectedJob(updatedSelected)
    }
  }

  const saveJob = () => {
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

    const newJob: Job = {
      id: editingId || createId(),
      company,
      installer,
      jobType: isSalesOnly ? 'Sales Call' : jobType,
      name: name.trim(),
      phone,
      status: existingJob?.status || 'Open',
    }

    const updated = editingId
      ? jobs.map((job) => (job.id === editingId ? newJob : job))
      : [newJob, ...jobs]

    saveJobs(updated)

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

  const deleteJob = (id: string) => {
    const updated = jobs.filter((job) => job.id !== id)
    saveJobs(updated)

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

    openSms(selectedJob.phone, message)
  }

  const callCustomer = () => {
    if (!selectedJob) return
    openCall(selectedJob.phone)
  }

  const sendThankYou = () => {
    if (!selectedJob) return

    const message =
      selectedJob.jobType === 'Sales Call'
        ? `Hello, thank you for taking the time to meet with me today. I really enjoyed learning more about your project and helping find the best solution for your home. If any questions come up, I’m here to help. I’d love the opportunity to earn your business.`
        : `Hello, thank you for choosing us. We truly appreciate your business and hope you feel great about the work completed for you. It means a lot to us to be trusted with your project, and if you ever need anything in the future, we’d be glad to help.`

    openSms(selectedJob.phone, message)
  }

  const askForReview = () => {
    if (!selectedJob) return

    const reviewLinks: Record<string, string> = {
      Intellihome: 'https://g.page/r/Cfa0Ouenna50EBM/review',
      'Crabtree Custom Electric, LLC':
        'https://g.page/r/CTJGBytOBuuyEBM/review',
    }

    const reviewLink = reviewLinks[selectedJob.company] || ''

    const message = `Hello, thank you again for trusting us with your project. If you were happy with your experience, we’d really appreciate a quick review: ${reviewLink}`

    openSms(selectedJob.phone, message)
  }

  const returnNeeded = () => {
    if (!selectedJob) return

    updateJobStatus(selectedJob.id, 'Needs Return')

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

  const jobComplete = () => {
    if (!selectedJob) return

    updateJobStatus(selectedJob.id, 'Completed')

    openSms(
      ownerPhone,
      `JOB COMPLETE
Installer: ${selectedJob.installer}
Customer: ${selectedJob.name}
Type: ${selectedJob.jobType || 'General'}`
    )
  }

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

  const filteredJobs = useMemo(() => {
    if (statusFilter === 'All') return jobs
    return jobs.filter((job) => job.status === statusFilter)
  }, [jobs, statusFilter])

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
      </div>

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

      {view === 'jobs' && !selectedJob && (
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
              Needs Return (
              {jobs.filter((job) => job.status === 'Needs Return').length})
            </button>
            <button
              style={filterButtonStyle('Completed')}
              onClick={() => setStatusFilter('Completed')}
            >
              Completed ({jobs.filter((job) => job.status === 'Completed').length}
              )
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
                    <strong>{job.name}</strong>
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
