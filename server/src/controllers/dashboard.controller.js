const db = require('../utils/db');

const dashboardController = {
  // Get clinic statistics
  getStats: async (req, res) => {
    try {
      // Get total patients
      const patientCountResult = await db.query('SELECT COUNT(*) as count FROM patients WHERE is_archived = FALSE');
      const patientCount = patientCountResult[0];
      
      // Get total staff
      const staffCountResult = await db.query('SELECT COUNT(*) as count FROM staff WHERE is_active = TRUE');
      const staffCount = staffCountResult[0];
      
      // Get today's appointments
      const todayAppointmentsResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE appointment_date = CURDATE() 
        AND status NOT IN ('Cancelled')
      `);
      const todayAppointments = todayAppointmentsResult[0];
      
      // Get upcoming appointments (next 7 days)
      const upcomingAppointmentsResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE appointment_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND status NOT IN ('Cancelled')
      `);
      const upcomingAppointments = upcomingAppointmentsResult[0];
      
      // Get appointment statistics this month
      const monthlyStatsResult = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
        FROM appointments 
        WHERE MONTH(appointment_date) = MONTH(CURDATE())
        AND YEAR(appointment_date) = YEAR(CURDATE())
      `);
      const monthlyStats = monthlyStatsResult[0];
      
      res.status(200).json({
        success: true,
        data: {
          total_patients: patientCount.count,
          total_staff: staffCount.count,
          today_appointments: todayAppointments.count,
          upcoming_appointments: upcomingAppointments.count,
          monthly_stats: monthlyStats
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics'
      });
    }
  },

  // Get recent appointments
  getRecentAppointments: async (req, res) => {
    try {
      const appointments = await db.query(`
        SELECT a.id, a.appointment_date, a.appointment_time, 
               a.status, a.notes,
               p.first_name as patient_first_name, 
               p.last_name as patient_last_name,
               p.medical_record_number,
               s.first_name as doctor_first_name, 
               s.last_name as doctor_last_name,
               s.role as staff_role
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN staff s ON a.doctor_id = s.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 10
      `);
      
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });

    } catch (error) {
      console.error('Get recent appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent appointments'
      });
    }
  },

  // Get patient count
  getPatientCount: async (req, res) => {
    try {
      const totalResult = await db.query('SELECT COUNT(*) as count FROM patients WHERE is_archived = FALSE');
      const archivedResult = await db.query('SELECT COUNT(*) as count FROM patients WHERE is_archived = TRUE');
      
      const total = totalResult[0];
      const archived = archivedResult[0];
      
      res.status(200).json({
        success: true,
        data: {
          active_patients: total.count,
          archived_patients: archived.count,
          total: total.count + archived.count
        }
      });

    } catch (error) {
      console.error('Get patient count error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patient count'
      });
    }
  }
};

module.exports = dashboardController;
