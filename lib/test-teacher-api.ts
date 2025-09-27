// Test file for teacher API functions
// This can be used to test the API functions independently

import { 
  getTeacherDashboardStats, 
  getAttendanceTrends, 
  getAtRiskStudents,
  getAttendanceHeatmap,
  getRecentAttendance,
  getTeacherTimetable,
  getTeacherStudents,
  getTeacherAttendance,
  getTeacherReports
} from './teacher-api'

// Test function to verify API functions
export async function testTeacherAPI() {
  try {
    console.log('Testing Teacher API functions...')
    
    // Test with a sample teacher ID
    const teacherId = '550e8400-e29b-41d4-a716-446655440001' // From your seed data
    
    console.log('1. Testing dashboard stats...')
    const stats = await getTeacherDashboardStats(teacherId)
    console.log('Dashboard Stats:', stats)
    
    console.log('2. Testing attendance trends...')
    const trends = await getAttendanceTrends(teacherId, 'weekly')
    console.log('Attendance Trends:', trends)
    
    console.log('3. Testing at-risk students...')
    const atRisk = await getAtRiskStudents(teacherId)
    console.log('At-Risk Students:', atRisk)
    
    console.log('4. Testing heatmap data...')
    const heatmap = await getAttendanceHeatmap(teacherId, 0)
    console.log('Heatmap Data:', heatmap)
    
    console.log('5. Testing recent attendance...')
    const recent = await getRecentAttendance(teacherId, 5)
    console.log('Recent Attendance:', recent)
    
    console.log('6. Testing teacher timetable...')
    const timetable = await getTeacherTimetable(teacherId)
    console.log('Teacher Timetable:', timetable)
    
    console.log('7. Testing teacher students...')
    const students = await getTeacherStudents(teacherId)
    console.log('Teacher Students:', students)
    
    console.log('8. Testing teacher attendance...')
    const attendance = await getTeacherAttendance(teacherId)
    console.log('Teacher Attendance:', attendance)
    
    console.log('9. Testing teacher reports...')
    const reports = await getTeacherReports(teacherId, 30)
    console.log('Teacher Reports:', reports)
    
    console.log('✅ All API tests completed successfully!')
    return true
  } catch (error) {
    console.error('❌ API test failed:', error)
    return false
  }
}

// Uncomment the line below to run tests
// testTeacherAPI()
