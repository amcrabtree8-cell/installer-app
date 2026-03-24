'use client'

import { useEffect, useState } from 'react'

type JobType = 'Install' | 'Sales Call' | ''

type Job = {
  id: string
  name: string
  phone: string
  address: string
  company: string
  installer: string
  jobType: JobType
}

const companies = {
  Intellihome: ['Cody', 'Jordan', 'Colby', 'Darrius', 'Chip', Tanner'],
  'Crabtree Custom Electric, LLC': ['Logan', 'Malachi', 'Tanner'],
}

export default function Home() {
  const [view, setView] = useState<'add' | 'jobs'>('add')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const [company, setCompany] = useState('')
  const [installer, setInstaller] = useState('')
  const [jobType, setJobType] = useState<JobType>('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [jobs, setJobs] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const ownerPhone = '6153101346'

  const availableInstallers = company
    ? companies[company as keyof typeof companies] ?? []
    : []

  const showJobType = installer === 'Cody' || installer === 'Tanner'
  const isSalesOnly = installer === 'Chip'

  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('jobs')
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs)
        if (Array.isArray(parsed)) setJobs(parsed)
      }
    } catch (error) {
      console.error('Failed to load jobs from localStorage', error)
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

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value))
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
    setAddress('')
    setEditingId(null)
  }

  const loadJobForEdit = (job: Job) => {
    setCompany(job.company)
    setInstaller(job.installer)
    setJobType(job.jobType)
    setName(job.name)
    setPhone(job.phone)
    setAddress(job.address)
    setEditingId(job.id)
    setSelectedJob(null)
    setView('add')
  }

  const saveJob = () => {
    if (!company || !installer || !name.trim() || !phone.trim() || !address.trim()) {
      alert('Fill all required fields')
      return
    }

    if (showJobType && !isSalesOnly && !jobType) {
      alert('Please select a job type')
      return
    }

    const newJob: Job = {
      id: editingId || crypto.randomUUID(),
      company,
      installer,
      jobType: isSalesOnly ? 'Sales Call' : jobType,
      name: name.trim(),
      phone,
      address: address.trim(),
    }

    const updated = editingId
      ? jobs.map((job) => (job.id === editingId ? newJob : job))
      : [newJob, ...jobs]

   saveJobs(updated)

const message = `Hello, this is ${installer} from ${company}. Thank you again for trusting us with your project - we truly appreciate it! Let me know if you need anything at all.`

const smsLink = `sms:${cleanPhone(phone)}?body=${encodeURIComponent(message)}`

clearForm()
setView('jobs')
window.location.href = smsLink
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

    window.location.href = `sms:${cleanPhone(selectedJob.phone)}?body=${encodeURIComponent(message)}`
  }

  const callCustomer = () => {
    if (!selectedJob) return
    window.location.href = `tel:${cleanPhone(selectedJob.phone)}`
  }

     const body =
      selectedJob.jobType === 'Sales Call'
        ? `Hello, thank you for taking the time to meet with me today. I really enjoyed learning more about your project and helping find the best solution for your home. If any questions come up, I’m here to help. I’d love the opportunity to earn your business.`
        : `Hello, thank you for choosing us. We truly appreciate your business and hope you feel great about the work completed in your home. It means a lot to us to be trusted with your project, and if you ever need anything in the future, we’d be glad to help.`

  const askForReview = () => {
    if (!selectedJob) return

    const message = `Hi ${selectedJob.name}, thank you again for trusting us with your project. If you were happy with your experience, we’d really appreciate a quick review. It would mean a lot to us.`

    window.location.href = `sms:${cleanPhone(selectedJob.phone)}?body=${encodeURIComponent(message)}`
  }

const askForReview = () => {
  if (!selectedJob) return

  const reviewLinks: Record<string, string> = {
    Intellihome: 'https://g.page/r/Cfa0Ouenna50EBM/review',
    'Crabtree Custom Electric, LLC': 'https://g.page/r/CTJGBytOBuuyEBM/review',
  }

  const reviewLink = reviewLinks[selectedJob.company] || ''

  const message = `Hello, thank you again for trusting us with your project. If you were happy with your experience, we’d really appreciate a quick review: ${reviewLink}`

  window.location.href = `sms:${cleanPhone(selectedJob.phone)}?body=${encodeURIComponent(message)}`
}

    const message = `${selectedJob.installer} completed ${selectedJob.jobType || 'job'} for ${selectedJob.name} at ${selectedJob.address}.`

    window.location.href = `sms:${ownerPhone}?body=${encodeURIComponent(message)}`
  }

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
          <select
            value={company}
            onChange={(e) => {
              const nextCompany = e.target.value
              setCompany(nextCompany)
              setInstaller('')
              setJobType('')
            }}
          >
            <option value="">Select Company</option>
            {Object.keys(companies).map((companyName) => (
              <option key={companyName} value={companyName}>
                {companyName}
              </option>
            ))}
          </select>

          <select
            value={installer}
            onChange={(e) => setInstaller(e.target.value)}
            disabled={!company}
          >
            <option value="">Select Installer</option>
            {availableInstallers.map((person) => (
              <option key={person} value={person}>
                {person}
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
            onChange={(e) => handlePhoneChange(e.target.value)}
          />

    
          <input
            placeholder="Address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveJob}>{editingId ? 'Update Job' : 'Save Job'}</button>

            {editingId && <button onClick={clearForm}>Cancel Edit</button>}
          </div>
        </div>
      )}

      {view === 'jobs' && !selectedJob && (
        <div style={{ display: 'grid', gap: 12 }}>
          {jobs.length === 0 ? (
            <p>No jobs saved yet.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <div onClick={() => setSelectedJob(job)}>
                  <strong>{job.name}</strong>
                  <div>{job.address}</div>
                  <div style={{ fontSize: 14, color: '#555' }}>
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
          <p style={{ margin: 0 }}>{selectedJob.address}</p>
          <p style={{ margin: 0 }}>{selectedJob.phone}</p>
          {selectedJob.email && <p style={{ margin: 0 }}>{selectedJob.email}</p>}
          <p style={{ margin: 0 }}>
            {selectedJob.company} • {selectedJob.installer}
            {selectedJob.jobType ? ` • ${selectedJob.jobType}` : ''}
          </p>

          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <button onClick={textOnMyWay}>On My Way</button>
            <button onClick={callCustomer}>Call</button>
            <button onClick={sendThankYou}>Thank You</button>

            {selectedJob.jobType !== 'Sales Call' && (
              <button onClick={askForReview}>Ask Review</button>
            )}

            <button onClick={jobComplete}>Job Complete</button>
            <button onClick={() => loadJobForEdit(selectedJob)}>Edit Job</button>
            <button onClick={() => deleteJob(selectedJob.id)}>Delete Job</button>
          </div>
        </div>
      )}
    </main>
  )
}
