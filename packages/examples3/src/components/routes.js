import PersonForm from './pages/PersonForm';
import SchedulingInstructionsForm from './pages/SchedulingInstructionsForm';

export default [
    {
        url: '/contact-form',
        name: "Contact Form",
        desc: "various input types",
        component: PersonForm,
    },
    {
        url: '/scheduling-instructions',
        name: "Scheduling Instructions",
        desc: "repeatable form elements",
        component: SchedulingInstructionsForm,
    },
    {
        url: '/seizure-tracking',
        name: "Seizure Tracking",
    },
    {
        url: '/incident-reports',
        name: "Incident Reports",
    },
]