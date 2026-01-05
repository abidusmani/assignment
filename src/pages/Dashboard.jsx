import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// localStorage helper functions
const getEmployeesFromStorage = () => {
  const data = localStorage.getItem('employees')
  return data ? JSON.parse(data) : []
}

const saveEmployeesToStorage = (employees) => {
  localStorage.setItem('employees', JSON.stringify(employees))
}

const generateId = () => {
  const employees = getEmployeesFromStorage()
  const lastId = employees.length > 0 
    ? Math.max(...employees.map(e => parseInt(e.id.replace('EMP', ''))))
    : 0
  return `EMP${String(lastId + 1).padStart(3, '0')}`
}

function Dashboard() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dob: '',
    state: '',
    isActive: true,
    profileImage: ''
  })

  // Protect route
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      navigate('/')
    }
  }, [navigate])

  // Load employees from localStorage
  useEffect(() => {
    const storedEmployees = getEmployeesFromStorage()
    setEmployees(storedEmployees)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    navigate('/')
  }

  // Handle image upload - convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1000000) { // 500KB limit
        alert('Image size should be less than 500KB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: 'Male',
      dob: '',
      state: '',
      isActive: true,
      profileImage: ''
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  // Open form for adding
  const handleAdd = () => {
    resetForm()
    setShowForm(true)
  }

  // Open form for editing
  const handleEdit = (employee) => {
    setFormData({
      fullName: employee.fullName,
      gender: employee.gender,
      dob: employee.dob,
      state: employee.state,
      isActive: employee.isActive,
      profileImage: employee.profileImage
    })
    setEditingEmployee(employee)
    setShowForm(true)
  }

  // Submit form (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...formData, id: emp.id }
          : emp
      )
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
    } else {
      // Add new employee
      const newEmployee = {
        id: generateId(),
        ...formData
      }
      const updatedEmployees = [...employees, newEmployee]
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
    }
    
    resetForm()
  }

  // Delete employee
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id)
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
    }
  }

  // Toggle active status
  const toggleActiveStatus = (id) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, isActive: !emp.isActive } : emp
    )
    setEmployees(updatedEmployees)
    saveEmployeesToStorage(updatedEmployees)
  }

  // Print employee
  const handlePrint = (employee) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head><title>Employee - ${employee.fullName}</title>
        <style>body{font-family:Arial,sans-serif;padding:20px;}.label{font-weight:bold;}img{width:80px;height:80px;border-radius:50%;}</style></head>
        <body>
          <h2>Employee Details</h2>
          ${employee.profileImage ? `<img src="${employee.profileImage}" alt="${employee.fullName}"/>` : ''}
          <p><span class="label">ID:</span> ${employee.id}</p>
          <p><span class="label">Name:</span> ${employee.fullName}</p>
          <p><span class="label">Gender:</span> ${employee.gender}</p>
          <p><span class="label">DOB:</span> ${employee.dob}</p>
          <p><span class="label">State:</span> ${employee.state}</p>
          <p><span class="label">Status:</span> ${employee.isActive ? 'Active' : 'Inactive'}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = filterGender === 'All' || emp.gender === filterGender
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Active' && emp.isActive) || 
      (filterStatus === 'Inactive' && !emp.isActive)
    return matchesSearch && matchesGender && matchesStatus
  })

  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.isActive).length
  const inactiveEmployees = employees.filter(emp => !emp.isActive).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Employee Management</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-semibold text-gray-800">{totalEmployees}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-green-600">{activeEmployees}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-semibold text-red-600">{inactiveEmployees}</p>
          </div>
        </div>

        {/* Add Employee Button and Search/Filter */}
        <div className="mb-4 space-y-4">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search by Name */}
            <div className="flex-1">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filter by Gender */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Employee Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max size: 500KB</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Active</label>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    {editingEmployee ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">Employee List</h2>
          </div>

          {employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No employees found</p>
              <p className="text-sm">Click "Add Employee" to get started</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No matching employees</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Profile</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Gender</th>
                      <th className="px-4 py-3 font-medium">DOB</th>
                      <th className="px-4 py-3 font-medium">State</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="text-sm">
                        <td className="px-4 py-3 text-gray-800">{emp.id}</td>
                        <td className="px-4 py-3">
                          {emp.profileImage ? (
                            <img src={emp.profileImage} alt={emp.fullName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-800">{emp.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.dob}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.state}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActiveStatus(emp.id)}
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${
                              emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button onClick={() => handlePrint(emp)} className="p-2 text-gray-600 hover:bg-gray-50 rounded cursor-pointer" title="Print">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.fullName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{emp.fullName}</p>
                        <p className="text-xs text-gray-500">{emp.id}</p>
                      </div>
                      <button
                        onClick={() => toggleActiveStatus(emp.id)}
                        className={`px-2 py-1 text-xs rounded cursor-pointer ${
                          emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p><span className="text-gray-500">Gender:</span> {emp.gender}</p>
                      <p><span className="text-gray-500">DOB:</span> {emp.dob}</p>
                      <p><span className="text-gray-500">State:</span> {emp.state}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(emp)} className="flex-1 flex items-center justify-center gap-1 py-2 text-blue-600 bg-blue-50 rounded cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="flex-1 flex items-center justify-center gap-1 py-2 text-red-600 bg-red-50 rounded cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-xs">Delete</span>
                      </button>
                      <button onClick={() => handlePrint(emp)} className="flex-1 flex items-center justify-center gap-1 py-2 text-gray-600 bg-gray-50 rounded cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span className="text-xs">Print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
