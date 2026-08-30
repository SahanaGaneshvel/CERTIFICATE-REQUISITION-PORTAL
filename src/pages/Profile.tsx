import { User, Mail, Phone, Building2, Calendar, GraduationCap, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../components/ui';
import styles from './Profile.module.css';

export function Profile() {
  const { user } = useAuth();

  const profileSections = [
    {
      title: 'Personal Information',
      icon: <User size={20} />,
      fields: [
        { label: 'Full Name', value: user?.name, icon: <User size={18} /> },
        { label: 'Register Number', value: user?.registerNo, icon: <GraduationCap size={18} /> },
        { label: 'Date of Birth', value: user?.dateOfBirth, icon: <Calendar size={18} /> },
        { label: 'Gender', value: user?.gender, icon: <User size={18} /> },
      ],
    },
    {
      title: 'Academic Information',
      icon: <GraduationCap size={20} />,
      fields: [
        { label: 'Degree', value: user?.degree, icon: <GraduationCap size={18} /> },
        { label: 'Branch', value: user?.branch, icon: <Building2 size={18} /> },
        { label: 'Admitted Year', value: user?.admittedYear, icon: <Calendar size={18} /> },
        { label: 'Institution', value: user?.institution, icon: <MapPin size={18} /> },
        { label: 'Campus', value: user?.campus, icon: <MapPin size={18} /> },
      ],
    },
    {
      title: 'Contact Information',
      icon: <Phone size={20} />,
      fields: [
        { label: 'Mobile Number', value: user?.mobileNumber || 'Not provided', icon: <Phone size={18} /> },
        { label: 'Alternate Mobile', value: user?.alternateMobile || 'Not provided', icon: <Phone size={18} /> },
        { label: 'Email ID', value: user?.email || 'Not provided', icon: <Mail size={18} /> },
        { label: 'Alternate Email', value: user?.alternateEmail || 'Not provided', icon: <Mail size={18} /> },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>Profile</h1>
        </div>
        <Badge variant="green">Verified Student</Badge>
      </div>

      {/* Profile Card */}
      <Card variant="default" padding="lg" className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <User size={40} />
            </div>
            <div className={styles.avatarInfo}>
              <h2 className={styles.profileName}>{user?.name}</h2>
              <p className={styles.profileId}>{user?.registerNo}</p>
              <p className={styles.profileCourse}>
                {user?.degree} - {user?.branch}
              </p>
            </div>
          </div>
          <div className={styles.profileBadges}>
            <Badge variant="orange">Batch {user?.admittedYear}</Badge>
            <Badge variant="green">{user?.campus}</Badge>
          </div>
        </div>
      </Card>

      {/* Profile Sections */}
      <div className={styles.sectionsGrid}>
        {profileSections.map((section) => (
          <Card key={section.title} variant="default" padding="lg">
            <CardHeader>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>{section.icon}</div>
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.fieldsGrid}>
                {section.fields.map((field) => (
                  <div key={field.label} className={styles.field}>
                    <div className={styles.fieldIcon}>{field.icon}</div>
                    <div className={styles.fieldContent}>
                      <span className={styles.fieldLabel}>{field.label}</span>
                      <span className={styles.fieldValue}>{field.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}