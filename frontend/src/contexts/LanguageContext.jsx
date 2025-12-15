import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation dictionaries
const translations = {
    en: {
        // Navigation
        home: 'Home',
        screening: 'Screening',
        history: 'History',
        analytics: 'Analytics',
        about: 'About',

        // Common
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        loading: 'Loading...',

        // Screening Form
        screeningTitle: 'Sleep Health Screening',
        personalInfo: 'Personal Information',
        age: 'Age',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        sleepData: 'Sleep Data',
        sleepDuration: 'Sleep Duration (hours)',
        sleepQuality: 'Sleep Quality',
        lifestyle: 'Lifestyle',
        physicalActivity: 'Physical Activity',
        dailySteps: 'Daily Steps',
        healthMetrics: 'Health Metrics',
        heartRate: 'Heart Rate (bpm)',
        bloodPressure: 'Blood Pressure',
        weight: 'Weight',
        height: 'Height',

        // Validation Messages
        ageRequired: 'Age is required',
        genderRequired: 'Gender must be selected',
        sleepDurationRequired: 'Sleep duration is required',
        bloodPressureRequired: 'Blood pressure must be filled in correct format (e.g., 120/80)',
        heartRateRequired: 'Heart rate is required',
        dailyStepsRequired: 'Daily steps is required',
        weightRequired: 'Weight is required',
        heightRequired: 'Height is required',
        sleepQualityQuestionsRequired: 'All sleep quality questions must be answered',
        stressQuestionsRequired: 'All stress level questions must be answered',

        // Analytics
        analyticsTitle: 'Analytics Dashboard',
        totalScreenings: 'Total Screenings',
        activeRules: 'Active Rules',
        avgRulesFired: 'Avg Rules Fired',
        mostCommon: 'Most Common',
        noAnalyticsAvailable: 'No Analytics Available',
        noAssignmentMessage: "You haven't done any assignment",
        startFirstScreening: 'Start Your First Screening',
    },

    id: {
        // Navigation
        home: 'Beranda',
        screening: 'Screening',
        history: 'Riwayat',
        analytics: 'Analitik',
        about: 'Tentang',

        // Common
        submit: 'Kirim',
        cancel: 'Batal',
        save: 'Simpan',
        delete: 'Hapus',
        edit: 'Edit',
        close: 'Tutup',
        loading: 'Memuat...',

        // Screening Form
        screeningTitle: 'Screening Kesehatan Tidur',
        personalInfo: 'Informasi Pribadi',
        age: 'Usia',
        gender: 'Jenis Kelamin',
        male: 'Laki-laki',
        female: 'Perempuan',
        sleepData: 'Data Tidur',
        sleepDuration: 'Durasi Tidur (jam)',
        sleepQuality: 'Kualitas Tidur',
        lifestyle: 'Gaya Hidup',
        physicalActivity: 'Aktivitas Fisik',
        dailySteps: 'Langkah Harian',
        healthMetrics: 'Metrik Kesehatan',
        heartRate: 'Detak Jantung (bpm)',
        bloodPressure: 'Tekanan Darah',
        weight: 'Berat Badan',
        height: 'Tinggi Badan',

        // Validation Messages
        ageRequired: 'Usia harus diisi',
        genderRequired: 'Jenis kelamin harus dipilih',
        sleepDurationRequired: 'Durasi tidur harus diisi',
        bloodPressureRequired: 'Tekanan darah harus diisi dengan format yang benar (contoh: 120/80)',
        heartRateRequired: 'Detak jantung harus diisi',
        dailyStepsRequired: 'Langkah harian harus diisi',
        weightRequired: 'Berat badan harus diisi',
        heightRequired: 'Tinggi badan harus diisi',
        sleepQualityQuestionsRequired: 'Semua pertanyaan kualitas tidur harus dijawab',
        stressQuestionsRequired: 'Semua pertanyaan tingkat stress harus dijawab',

        // Analytics
        analyticsTitle: 'Dashboard Analitik',
        totalScreenings: 'Total Screening',
        activeRules: 'Aturan Aktif',
        avgRulesFired: 'Rata-rata Aturan Dipicu',
        mostCommon: 'Paling Umum',
        noAnalyticsAvailable: 'Tidak Ada Analitik',
        noAssignmentMessage: 'Anda belum melakukan screening',
        startFirstScreening: 'Mulai Screening Pertama',
    },

    zh: {
        // Navigation
        home: '首页',
        screening: '筛查',
        history: '历史',
        analytics: '分析',
        about: '关于',

        // Common
        submit: '提交',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        close: '关闭',
        loading: '加载中...',

        // Screening Form
        screeningTitle: '睡眠健康筛查',
        personalInfo: '个人信息',
        age: '年龄',
        gender: '性别',
        male: '男',
        female: '女',
        sleepData: '睡眠数据',
        sleepDuration: '睡眠时长（小时）',
        sleepQuality: '睡眠质量',
        lifestyle: '生活方式',
        physicalActivity: '体育活动',
        dailySteps: '每日步数',
        healthMetrics: '健康指标',
        heartRate: '心率（bpm）',
        bloodPressure: '血压',
        weight: '体重',
        height: '身高',

        // Validation Messages
        ageRequired: '年龄为必填项',
        genderRequired: '必须选择性别',
        sleepDurationRequired: '睡眠时长为必填项',
        bloodPressureRequired: '血压必须以正确格式填写（例如：120/80）',
        heartRateRequired: '心率为必填项',
        dailyStepsRequired: '每日步数为必填项',
        weightRequired: '体重为必填项',
        heightRequired: '身高为必填项',
        sleepQualityQuestionsRequired: '必须回答所有睡眠质量问题',
        stressQuestionsRequired: '必须回答所有压力水平问题',

        // Analytics
        analyticsTitle: '分析仪表板',
        totalScreenings: '总筛查次数',
        activeRules: '活动规则',
        avgRulesFired: '平均触发规则',
        mostCommon: '最常见',
        noAnalyticsAvailable: '无可用分析',
        noAssignmentMessage: '您还没有进行任何筛查',
        startFirstScreening: '开始您的第一次筛查',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage or default to Indonesian
        return localStorage.getItem('appLanguage') || 'id';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations['en'][key] || key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
