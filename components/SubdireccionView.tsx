

import React, { useState, useMemo } from 'react';
import { Printer, Calendar, FileText, PenTool, Plus, ArrowLeft, ClipboardList, Eye, Save, Trash2, User, CheckSquare, Square } from 'lucide-react';
import { SchoolData, VisitLog, Minuta, Citation, User as UserType } from '../types';

// Updated Logo Placeholder and Constants
const LOGO_URL = "https://cdn1.sharemyimage.com/smi/2025/10/05/27tv.png"; 
const CCT = "09DES4027P";

interface SubdireccionViewProps {
  data: SchoolData;
  onUpdateData: (newData: SchoolData) => void;
  currentUser: UserType;
  currentCycle: string;
}

type SubTab = 'citatorios' | 'bitacora' | 'minuta';
type Mode = 'list' | 'create';
type BitacoraType = 'inasistencia' | 'conducta' | 'accidente';

const SubdireccionView: React.FC<SubdireccionViewProps> = ({ data, onUpdateData, currentUser, currentCycle }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('citatorios');
  
  // Global Config for Subdireccion Formats
  const [schoolCycle, setSchoolCycle] = useState(currentCycle);

  // Admins, Subdirector, and Secretaria can edit.
  const canEdit = ['admin', 'subdirector', 'secretaria'].includes(currentUser.role);

  // Teachers List for Dropdown
  const teachers = useMemo(() => 
    (data.users || []).filter(u => u.role === 'teacher').sort((a, b) => a.name.localeCompare(b.name)),
  [data.users]);

  // All Users for Conformity Dropdown
  const allStaff = useMemo(() => 
    (data.users || []).sort((a, b) => a.name.localeCompare(b.name)),
  [data.users]);

  const getOfficialRoleName = (role: string) => {
      switch (role) {
          case 'admin': return 'DIRECTOR';
          case 'subdirector': return 'SUBDIRECTOR DE GESTIÓN';
          case 'secretaria': return 'SECRETARIA DE DIRECCIÓN';
          case 'teacher': return 'DOCENTE';
          case 'administrative': return 'PERSONAL ADMINISTRATIVO';
          case 'red_escolar': return 'RESPONSABLE DE RED ESCOLAR';
          case 'laboratorista': return 'AYUDANTE DE LABORATORIO';
          case 'apoyo': return 'PERSONAL DE APOYO A LA EDUCACIÓN';
          default: return 'AUTORIDAD EDUCATIVA';
      }
  };

  // --- CITATORIOS STATE ---
  const [citationMode, setCitationMode] = useState<Mode>('list');
  const [citStudentName, setCitStudentName] = useState('');
  const [citStudentGroup, setCitStudentGroup] = useState('');
  const [citationDate, setCitationDate] = useState('');
  const [citationTime, setCitationTime] = useState('');
  const [citationReason, setCitationReason] = useState('');
  const [citationTeacherId, setCitationTeacherId] = useState(''); // New state for selected teacher

  // --- BITACORA STATE ---
  const [bitacoraMode, setBitacoraMode] = useState<Mode>('list');
  const [logType, setLogType] = useState<BitacoraType>('inasistencia'); // Toggle between types
  
  // Common Fields
  const [bitStudentName, setBitStudentName] = useState('');
  const [bitStudentGroup, setBitStudentGroup] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitStartTime, setVisitStartTime] = useState(''); // HORA
  const [location, setLocation] = useState(''); // LUGAR
  const [whoReported, setWhoReported] = useState(''); // QUIEN REPORTA
  const [involvedStudents, setInvolvedStudents] = useState(''); // ALUMNOS INVOLUCRADOS
  const [narrative, setNarrative] = useState(''); // NARRACIÓN
  const [parentName, setParentName] = useState(''); // PADRE TUTOR
  const [conformityStaffId, setConformityStaffId] = useState(''); // Personal Conformidad

  // Checkboxes
  const [informedDirector, setInformedDirector] = useState(false);
  const [informedSubdirector, setInformedSubdirector] = useState(false);
  const [informedParent, setInformedParent] = useState(false);
  const [informedUdeei, setInformedUdeei] = useState(false);

  // Inasistencia Specifics
  const [teacherActions, setTeacherActions] = useState('');
  const [formativeAction, setFormativeAction] = useState('');
  const [generatedCitation, setGeneratedCitation] = useState(false);
  const [udeeiActions, setUdeeiActions] = useState('');
  const [technicalMeasure, setTechnicalMeasure] = useState(''); // Si no asiste

  // Conducta Specifics
  const [pedagogicalMeasure, setPedagogicalMeasure] = useState(''); // Acciones aplicadas
  const [conciliation, setConciliation] = useState(false);
  const [canalization, setCanalization] = useState(false);
  const [canalizationInstitution, setCanalizationInstitution] = useState('');
  const [bullyingProtocol, setBullyingProtocol] = useState(false);
  const [bullyingProtocolReason, setBullyingProtocolReason] = useState('');
  const [vaSeguro, setVaSeguro] = useState(false);
  const [vaSeguroObservation, setVaSeguroObservation] = useState('');

  // Footer Fields
  const [agreementsParent, setAgreementsParent] = useState('');
  const [agreementsStudent, setAgreementsStudent] = useState('');
  const [attentionToParent, setAttentionToParent] = useState(''); // Que atencion se dio

  // --- MINUTA STATE ---
  const [minutaMode, setMinutaMode] = useState<Mode>('list');
  const [minStudentName, setMinStudentName] = useState('');
  const [minStudentGroup, setMinStudentGroup] = useState('');
  const [minutaDate, setMinutaDate] = useState(new Date().toISOString().split('T')[0]);
  const [minutaTime, setMinutaTime] = useState('');
  const [minutaParentName, setMinutaParentName] = useState('');
  const [minutaSubject, setMinutaSubject] = useState(''); 
  const [minutaDescription, setMinutaDescription] = useState(''); 
  const [minutaActions, setMinutaActions] = useState(''); 
  const [minutaAgreements, setMinutaAgreements] = useState(''); 
  const [minutaAttendedBy, setMinutaAttendedBy] = useState(''); 

  const handlePrint = () => {
    window.print();
  };

  // --- LOGIC: CITATORIOS ---
  const handleSaveCitation = () => {
      if (!canEdit) return;
      if (!citStudentName || !citationDate) return;

      const teacher = teachers.find(t => t.id === citationTeacherId);
      const newCit: Citation = {
          id: Date.now().toString(),
          studentName: citStudentName,
          group: citStudentGroup,
          date: citationDate,
          time: citationTime,
          reason: citationReason,
          createdAt: new Date().toISOString(),
          teacherId: citationTeacherId || undefined,
          teacherName: teacher ? teacher.name : undefined
      };

      const currentCitations = data.citations || [];
      onUpdateData({ ...data, citations: [newCit, ...currentCitations] });

      setCitationMode('list');
      setCitStudentName('');
      setCitStudentGroup('');
      setCitationReason('');
      setCitationTime('');
      setCitationTeacherId('');
  };

  const loadCitation = (cit: Citation) => {
      setCitStudentName(cit.studentName);
      setCitStudentGroup(cit.group);
      setCitationDate(cit.date);
      setCitationTime(cit.time);
      setCitationReason(cit.reason);
      setCitationTeacherId(cit.teacherId || '');
      setCitationMode('create');
  };

  const handleDeleteCitation = (id: string) => {
      if (!canEdit) return;
      if(confirm('¿Eliminar citatorio?')) {
          onUpdateData({ ...data, citations: (data.citations || []).filter(c => c.id !== id) });
      }
  }

  // --- LOGIC: BITACORA ---
  const handleSaveVisit = () => {
    if (!bitStudentName) return;

    const newVisit: VisitLog = {
      id: Date.now().toString(),
      logType,
      studentId: null,
      studentName: bitStudentName,
      grade: '', 
      group: bitStudentGroup,
      parentName,
      date: visitDate,
      startTime: visitStartTime,
      endTime: '',
      location,
      whoReported,
      involvedStudents,
      narrative,
      informedDirector,
      informedSubdirector,
      informedParent,
      informedUdeei,
      
      teacherActions,
      formativeAction,
      generatedCitation,
      udeeiActions,
      technicalMeasure,

      pedagogicalMeasure,
      conciliation,
      canalization,
      canalizationInstitution,
      bullyingProtocol,
      bullyingProtocolReason,
      vaSeguro,
      vaSeguroObservation,

      agreementsParent,
      agreementsStudent,
      attentionToParent,
      conformityStaffId
    };

    onUpdateData({ ...data, visitLogs: [newVisit, ...(data.visitLogs || [])] });
    resetBitacoraForm();
    setBitacoraMode('list');
  };

  const resetBitacoraForm = () => {
      setBitStudentName('');
      setBitStudentGroup('');
      setVisitDate(new Date().toISOString().split('T')[0]);
      setVisitStartTime('');
      setLocation('');
      setWhoReported('');
      setInvolvedStudents('');
      setNarrative('');
      setParentName('');
      setConformityStaffId('');
      
      setInformedDirector(false);
      setInformedSubdirector(false);
      setInformedParent(false);
      setInformedUdeei(false);

      setTeacherActions('');
      setFormativeAction('');
      setGeneratedCitation(false);
      setUdeeiActions('');
      setTechnicalMeasure('');

      setPedagogicalMeasure('');
      setConciliation(false);
      setCanalization(false);
      setCanalizationInstitution('');
      setBullyingProtocol(false);
      setBullyingProtocolReason('');
      setVaSeguro(false);
      setVaSeguroObservation('');

      setAgreementsParent('');
      setAgreementsStudent('');
      setAttentionToParent('');
  }

  const loadVisit = (log: VisitLog) => {
      setLogType(log.logType || 'inasistencia');
      setBitStudentName(log.studentName);
      setBitStudentGroup(log.group);
      setVisitDate(log.date);
      setVisitStartTime(log.startTime);
      setLocation(log.location);
      setWhoReported(log.whoReported);
      setInvolvedStudents(log.involvedStudents);
      setNarrative(log.narrative);
      setParentName(log.parentName);
      setConformityStaffId(log.conformityStaffId || '');

      setInformedDirector(log.informedDirector);
      setInformedSubdirector(log.informedSubdirector);
      setInformedParent(log.informedParent);
      setInformedUdeei(log.informedUdeei);

      setTeacherActions(log.teacherActions);
      setFormativeAction(log.formativeAction);
      setGeneratedCitation(log.generatedCitation);
      setUdeeiActions(log.udeeiActions);
      setTechnicalMeasure(log.technicalMeasure);

      setPedagogicalMeasure(log.pedagogicalMeasure);
      setConciliation(log.conciliation);
      setCanalization(log.canalization);
      setCanalizationInstitution(log.canalizationInstitution);
      setBullyingProtocol(log.bullyingProtocol);
      setBullyingProtocolReason(log.bullyingProtocolReason);
      setVaSeguro(log.vaSeguro);
      setVaSeguroObservation(log.vaSeguroObservation);

      setAgreementsParent(log.agreementsParent);
      setAgreementsStudent(log.agreementsStudent);
      setAttentionToParent(log.attentionToParent);

      setBitacoraMode('create');
  }

  const handleDeleteVisit = (id: string) => {
      if(confirm('¿Eliminar registro de bitácora?')) {
          onUpdateData({ ...data, visitLogs: (data.visitLogs || []).filter(v => v.id !== id) });
      }
  }

  // --- LOGIC: MINUTA ---
  const handleSaveMinuta = () => {
    if (!minStudentName) return;
    const newMinuta: Minuta = {
      id: Date.now().toString(),
      studentId: null,
      studentName: minStudentName,
      grade: '',
      group: minStudentGroup,
      parentName: minutaParentName,
      date: minutaDate,
      startTime: minutaTime,
      subject: minutaSubject,
      description: minutaDescription,
      previousActions: minutaActions,
      agreements: minutaAgreements,
      attendedBy: minutaAttendedBy
    };
    onUpdateData({ ...data, minutas: [newMinuta, ...(data.minutas || [])] });
    setMinutaMode('list');
    setMinStudentName('');
    setMinStudentGroup('');
    setMinutaParentName('');
    setMinutaSubject('');
    setMinutaDescription('');
    setMinutaActions('');
    setMinutaAgreements('');
    setMinutaTime('');
    setMinutaAttendedBy('');
  };

  const loadMinuta = (min: Minuta) => {
      setMinStudentName(min.studentName);
      setMinStudentGroup(min.group);
      setMinutaDate(min.date);
      setMinutaTime(min.startTime);
      setMinutaParentName(min.parentName);
      setMinutaSubject(min.subject);
      setMinutaDescription(min.description);
      setMinutaActions(min.previousActions);
      setMinutaAgreements(min.agreements);
      setMinutaAttendedBy(min.attendedBy || '');
      setMinutaMode('create');
  }

  const handleDeleteMinuta = (id: string) => {
      if(confirm('¿Eliminar minuta?')) {
          onUpdateData({ ...data, minutas: (data.minutas || []).filter(m => m.id !== id) });
      }
  }

  const displayedCitations = useMemo(() => {
    if (currentUser.role === 'teacher') {
        return (data.citations || []).filter(c => c.teacherId === currentUser.id);
    }
    return data.citations || [];
  }, [data.citations, currentUser]);

  const getFolio = () => {
      if (logType === 'inasistencia') return 'INAS-APR';
      if (logType === 'conducta') return 'C';
      if (logType === 'accidente') return 'AE';
      return '';
  }

  return (
    <div className="flex flex-col h-full">
      <style>{`
          @media print {
            @page {
              size: letter portrait;
              margin: 5mm;
            }
          }
      `}</style>
      
      {/* HEADER (Hidden on Print) */}
      <div className="p-6 md:p-8 space-y-6 print:hidden bg-slate-50 border-b border-slate-200">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Subdirección Escolar</h2>
                <p className="text-slate-500">Gestión administrativa y relación con padres de familia.</p>
            </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
             <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('citatorios')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'citatorios' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Citatorios</button>
                {canEdit && <button onClick={() => setActiveTab('bitacora')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'bitacora' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bitácora</button>}
                {canEdit && <button onClick={() => setActiveTab('minuta')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'minuta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Minutas</button>}
            </div>
            <div className="ml-auto flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Ciclo Escolar:</label>
                <input type="text" value={schoolCycle} onChange={(e) => setSchoolCycle(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 bg-slate-100 overflow-auto print:p-0 print:bg-white print:overflow-visible">
        
        {/* --- CITATORIOS --- */}
        {activeTab === 'citatorios' && (
            <>
                {citationMode === 'list' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Historial de Citatorios</h3>
                            {canEdit && <button onClick={() => { setCitStudentName(''); setCitStudentGroup(''); setCitationDate(''); setCitationTime(''); setCitationReason(''); setCitationTeacherId(''); setCitationMode('create'); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"><Plus size={20} /> Nuevo Citatorio</button>}
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha Cita</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Grupo</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Docente</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedCitations.length > 0 ? displayedCitations.map(cit => (
                                        <tr key={cit.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cit.date ? new Date(cit.date).toLocaleDateString() : 'N/A'} {cit.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 uppercase">{cit.studentName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cit.group}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cit.teacherName || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadCitation(cit)} className="text-blue-600 hover:text-blue-800 mx-2"><Eye size={18} /></button>
                                                {canEdit && <button onClick={() => handleDeleteCitation(cit.id)} className="text-red-400 hover:text-red-600 mx-2"><Trash2 size={18} /></button>}
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay citatorios registrados.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* ... (Create citation form remains same) ... */}
                {citationMode === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800">Datos del Citatorio</h3>
                                <button onClick={() => setCitationMode('list')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <input type="text" disabled={!canEdit} placeholder="Nombre Alumno..." value={citStudentName} onChange={(e) => setCitStudentName(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                                <input type="text" disabled={!canEdit} placeholder="Grado y Grupo..." value={citStudentGroup} onChange={(e) => setCitStudentGroup(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                                <select value={citationTeacherId} disabled={!canEdit} onChange={(e) => setCitationTeacherId(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white">
                                    <option value="">-- Docente Solicitante --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="date" disabled={!canEdit} value={citationDate} onChange={(e) => setCitationDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                                    <input type="time" disabled={!canEdit} value={citationTime} onChange={(e) => setCitationTime(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                                </div>
                                <textarea rows={4} disabled={!canEdit} value={citationReason} onChange={(e) => setCitationReason(e.target.value)} className="w-full px-3 py-2 border rounded-xl resize-none" placeholder="Motivo..." />
                                <div className="flex gap-2 pt-2">
                                    {canEdit && <button onClick={handleSaveCitation} disabled={!citStudentName} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex justify-center items-center gap-2"><Save size={20} /> Guardar</button>}
                                    <button onClick={handlePrint} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-lg flex justify-center items-center gap-2"><Printer size={20} /> Imprimir</button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 print:w-full print:col-span-3">
                            <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] p-[20mm] print:shadow-none print:w-full print:max-w-none relative">
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-8 right-12 w-20 h-24 object-contain opacity-90 z-50" />
                                <div className="text-center mb-12 px-12">
                                    <h1 className="text-base font-bold uppercase">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                                    <h1 className="text-base font-bold uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                                    <p className="text-sm text-slate-600">Clave de Centro de Trabajo: {CCT}</p>
                                    <p className="text-sm text-slate-600">Ciclo Escolar {schoolCycle}</p>
                                    <h2 className="text-2xl font-bold mt-8 underline decoration-2 underline-offset-4 uppercase">CITATORIO</h2>
                                </div>
                                <div className="text-right mb-12">
                                    <p className="text-sm">Ciudad de México, a {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="space-y-6 text-justify leading-relaxed text-lg">
                                    <p><strong>C. Padre de Familia o Tutor</strong> <br /> del alumno(a): <span className="uppercase border-b border-black px-2 font-bold">{citStudentName || '__________________________________'}</span> <br /> del Grado y Grupo: <strong>{citStudentGroup || '_______'}</strong></p>
                                    <p className="indent-8">Por medio de la presente, se le solicita de la manera más atenta presentarse en las instalaciones de este plantel educativo el día <strong>{citationDate ? new Date(citationDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '_________________'}</strong> a las <strong>{citationTime || '_____'}</strong> horas.</p>
                                    <p className="indent-8">El motivo de su presencia es para tratar asuntos relacionados con la educación y conducta de su hijo(a), específicamente:</p>
                                    <div className="bg-slate-50 p-4 border border-slate-200 rounded min-h-[100px] italic print:bg-transparent print:border-0 print:p-0 print:italic">{citationReason || '(Especifique el motivo en el panel izquierdo)'}</div>
                                    {citationTeacherId && <p className="mt-2">Solicita: <span className="font-bold uppercase">{teachers.find(t => t.id === citationTeacherId)?.name}</span></p>}
                                    <p>Agradecemos de antemano su puntual asistencia y compromiso con la formación de su hijo(a).</p>
                                </div>
                                <div className="absolute bottom-[40mm] left-0 right-0 px-[20mm]">
                                    <div className="flex justify-between text-center">
                                        <div className="w-64"><div className="border-t border-black pt-2 mt-12"><p className="font-bold text-sm uppercase">{data.subdirector}</p><p className="text-xs">Subdirector(a) de Gestión</p></div></div>
                                        <div className="w-64"><div className="border-t border-black pt-2 mt-12"><p className="font-bold text-sm">Padre de Familia o Tutor</p><p className="text-xs">Recibí Citatorio</p></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* --- BITACORA --- */}
        {activeTab === 'bitacora' && canEdit && (
            <>
                {bitacoraMode === 'list' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Bitácora Escolar</h3>
                            <button onClick={() => { resetBitacoraForm(); setBitacoraMode('create'); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"><Plus size={20} /> Nuevo Reporte</button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Quien Reporta</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(data.visitLogs || []).length > 0 ? data.visitLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${log.logType === 'conducta' ? 'bg-red-100 text-red-600' : (log.logType === 'accidente' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600')}`}>{log.logType || 'inasistencia'}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-800">{log.studentName}</div><div className="text-xs text-slate-400">{log.group}</div></td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{log.whoReported}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadVisit(log)} className="text-blue-600 hover:text-blue-800 mx-2"><Eye size={18} /></button>
                                                <button onClick={() => handleDeleteVisit(log.id)} className="text-red-400 hover:text-red-600 mx-2"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay registros en la bitácora.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* ... (Bitacora create mode) ... */}
                {bitacoraMode === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        {/* ... Input Panel ... */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
                             <div className="flex flex-col border-b border-slate-100 pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">Llenado de Bitácora</h3>
                                    <button onClick={() => setBitacoraMode('list')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
                                </div>
                                <div className="flex p-1 bg-slate-100 rounded-lg gap-1">
                                    <button onClick={() => setLogType('inasistencia')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${logType === 'inasistencia' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Inasistencia</button>
                                    <button onClick={() => setLogType('conducta')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${logType === 'conducta' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Conducta</button>
                                    <button onClick={() => setLogType('accidente')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${logType === 'accidente' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>Accidente</button>
                                </div>
                             </div>

                             <div className="space-y-4">
                                {/* COMMON FIELDS */}
                                <input type="text" placeholder="Nombre Alumno..." value={bitStudentName} onChange={e => setBitStudentName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm uppercase" />
                                <input type="text" placeholder="Grado y Grupo..." value={bitStudentGroup} onChange={e => setBitStudentGroup(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    <input type="time" value={visitStartTime} onChange={e => setVisitStartTime(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>
                                <input type="text" placeholder="Lugar (Aula, Patio...)" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                <input type="text" placeholder="Quien Reporta..." value={whoReported} onChange={e => setWhoReported(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                <input type="text" placeholder="Alumnos Involucrados..." value={involvedStudents} onChange={e => setInvolvedStudents(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">¿A quién informé?</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={informedDirector} onChange={e => setInformedDirector(e.target.checked)}/> Director</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={informedSubdirector} onChange={e => setInformedSubdirector(e.target.checked)}/> Subdirector</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={informedParent} onChange={e => setInformedParent(e.target.checked)}/> Padre/Tutor</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={informedUdeei} onChange={e => setInformedUdeei(e.target.checked)}/> UDEEI</label>
                                    </div>
                                </div>

                                <textarea placeholder="Narración de los hechos..." rows={4} value={narrative} onChange={e => setNarrative(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />

                                {/* CONDITIONAL FIELDS */}
                                {logType === 'inasistencia' && (
                                    <>
                                        <textarea placeholder="Acciones Docente..." rows={2} value={teacherActions} onChange={e => setTeacherActions(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <textarea placeholder="Acción Formativa Aplicada..." rows={2} value={formativeAction} onChange={e => setFormativeAction(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={generatedCitation} onChange={e => setGeneratedCitation(e.target.checked)}/> ¿Se generó citatorio?</label>
                                        <textarea placeholder="Acciones con UDEEI..." rows={2} value={udeeiActions} onChange={e => setUdeeiActions(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <textarea placeholder="Medidas Técnico Pedagógicas..." rows={2} value={technicalMeasure} onChange={e => setTechnicalMeasure(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                    </>
                                )}
                                
                                {logType === 'conducta' && (
                                    <>
                                        <textarea placeholder="Acciones Aplicadas (Docente)..." rows={2} value={pedagogicalMeasure} onChange={e => setPedagogicalMeasure(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <textarea placeholder="Acción Formativa..." rows={2} value={formativeAction} onChange={e => setFormativeAction(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={generatedCitation} onChange={e => setGeneratedCitation(e.target.checked)}/> ¿Se generó citatorio?</label>
                                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={conciliation} onChange={e => setConciliation(e.target.checked)}/> ¿Se realizó conciliación?</label>
                                        <div className="bg-slate-50 p-2 rounded border">
                                            <label className="flex items-center gap-2 text-sm font-bold mb-1"><input type="checkbox" checked={canalization} onChange={e => setCanalization(e.target.checked)}/> ¿Requirió Canalización?</label>
                                            {canalization && <input type="text" placeholder="Institución..." value={canalizationInstitution} onChange={e => setCanalizationInstitution(e.target.value)} className="w-full p-1 border rounded text-xs" />}
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded border">
                                            <label className="flex items-center gap-2 text-sm font-bold mb-1"><input type="checkbox" checked={bullyingProtocol} onChange={e => setBullyingProtocol(e.target.checked)}/> ¿Protocolo Acoso Escolar?</label>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold">SI / NO ¿Por qué?</span>
                                                <input type="text" value={bullyingProtocolReason} onChange={e => setBullyingProtocolReason(e.target.value)} className="flex-1 p-1 border rounded text-xs" />
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded border">
                                            <label className="flex items-center gap-2 text-sm font-bold mb-1"><input type="checkbox" checked={vaSeguro} onChange={e => setVaSeguro(e.target.checked)}/> ¿Se activó Va Seguro?</label>
                                            {vaSeguro && <input type="text" placeholder="Observación..." value={vaSeguroObservation} onChange={e => setVaSeguroObservation(e.target.value)} className="w-full p-1 border rounded text-xs" />}
                                        </div>
                                    </>
                                )}

                                {logType === 'accidente' && (
                                    <>
                                        <textarea placeholder="Acciones Aplicadas (Docente) / Medidas..." rows={2} value={pedagogicalMeasure} onChange={e => setPedagogicalMeasure(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                        <div className="bg-slate-50 p-2 rounded border">
                                            <label className="flex items-center gap-2 text-sm font-bold mb-1"><input type="checkbox" checked={vaSeguro} onChange={e => setVaSeguro(e.target.checked)}/> ¿Se activó Va Seguro?</label>
                                            {vaSeguro && <input type="text" placeholder="Observación..." value={vaSeguroObservation} onChange={e => setVaSeguroObservation(e.target.value)} className="w-full p-1 border rounded text-xs" />}
                                        </div>
                                    </>
                                )}

                                {/* FOOTER COMMON */}
                                <input type="text" placeholder="Nombre Padre/Tutor..." value={parentName} onChange={e => setParentName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Personal que atiende (Conformidad)</label>
                                    <select value={conformityStaffId} onChange={e => setConformityStaffId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                        <option value="">-- Seleccionar --</option>
                                        {allStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({getOfficialRoleName(s.role)})</option>)}
                                    </select>
                                </div>

                                <textarea placeholder="Acuerdos Padre/Tutor..." rows={2} value={agreementsParent} onChange={e => setAgreementsParent(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                {logType === 'conducta' && <textarea placeholder="Acuerdos Alumnos..." rows={2} value={agreementsStudent} onChange={e => setAgreementsStudent(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />}
                                <textarea placeholder="Atención dada al padre..." rows={2} value={attentionToParent} onChange={e => setAttentionToParent(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />

                                <div className="flex gap-2 pt-4">
                                    <button onClick={handleSaveVisit} disabled={!bitStudentName} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"><Save size={16}/> Guardar</button>
                                    <button onClick={handlePrint} className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 flex items-center justify-center gap-2"><Printer size={16} /> Imprimir</button>
                                </div>
                             </div>
                        </div>

                        {/* PREVIEW PANEL (Right) */}
                        <div className="lg:col-span-2 print:w-full print:col-span-3">
                             {/* ... (Same Preview Content) ... */}
                             <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] print:shadow-none print:w-full print:max-w-none relative p-[10mm] text-black">
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-4 right-6 w-16 h-20 object-contain opacity-90 z-50" />
                                
                                {/* HEADER */}
                                <div className="text-center font-bold uppercase leading-snug mb-4 text-xs">
                                    <p>ESCUELA SECUNDARIA DIURNA No. 27 TV</p>
                                    <p>CCT: {CCT}</p>
                                    <p>CICLO ESCOLAR {schoolCycle}</p>
                                    <div className="flex justify-center items-end gap-2 mt-2">
                                        <p>BITÁCORA DEL GRADO Y GRUPO</p>
                                        <div className="border-b border-black w-32 text-center">{bitStudentGroup}</div>
                                    </div>
                                    <div className="text-right mt-2 font-bold text-sm">
                                        FOLIO: <span className="border-b border-black px-2">{getFolio()}</span> _________________
                                    </div>
                                </div>

                                {/* TABLE GRID STRUCTURE */}
                                <div className="border-2 border-black text-[10px]">
                                    
                                    {/* ROW 1: DATE/TIME */}
                                    <div className="flex border-b border-black bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact font-bold">
                                        <div className="w-1/3 border-r border-black p-1">FECHA DD/MM/AÑO</div>
                                        <div className="w-1/3 border-r border-black p-1">HORA</div>
                                        <div className="w-1/3 p-1">LUGAR</div>
                                    </div>
                                    <div className="flex border-b border-black">
                                        <div className="w-1/3 border-r border-black p-1 h-6">{visitDate ? new Date(visitDate).toLocaleDateString() : ''}</div>
                                        <div className="w-1/3 border-r border-black p-1 h-6">{visitStartTime}</div>
                                        <div className="w-1/3 p-1 h-6 uppercase">{location}</div>
                                    </div>

                                    {/* ROW 2: REPORTER / INVOLVED */}
                                    <div className="flex border-b border-black bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact font-bold">
                                        <div className="w-1/2 border-r border-black p-1">QUIEN REPORTA</div>
                                        <div className="w-1/2 p-1">ALUMNO(A)S INVOLUCRADO (S)</div>
                                    </div>
                                    <div className="flex border-b border-black">
                                        <div className="w-1/2 border-r border-black p-1 h-8 uppercase">{whoReported}</div>
                                        <div className="w-1/2 p-1 h-8 uppercase">
                                            {involvedStudents || bitStudentName}
                                        </div>
                                    </div>
                                    
                                    {/* ROW 3: INFORMED CHECKBOXES */}
                                    <div className="border-b border-black bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact font-bold p-1">
                                        ¿ A QUIÉN INFORMÉ ?
                                    </div>
                                    <div className="flex border-b border-black text-center text-[9px] font-bold">
                                        <div className="w-1/4 border-r border-black p-1 flex items-center justify-center gap-1">
                                            DIRECTOR {informedDirector ? <CheckSquare size={12}/> : <Square size={12}/>}
                                        </div>
                                        <div className="w-1/4 border-r border-black p-1 flex items-center justify-center gap-1">
                                            SUBDIRECTOR(A) {informedSubdirector ? <CheckSquare size={12}/> : <Square size={12}/>}
                                        </div>
                                        <div className="w-1/4 border-r border-black p-1 flex items-center justify-center gap-1">
                                            PADRE/TUTOR {informedParent ? <CheckSquare size={12}/> : <Square size={12}/>}
                                        </div>
                                        <div className="w-1/4 p-1 flex items-center justify-center gap-1">
                                            UDEEI {informedUdeei ? <CheckSquare size={12}/> : <Square size={12}/>}
                                        </div>
                                    </div>
                                    
                                    {/* ROW 4: DETAILS */}
                                    <div className="border-b border-black bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact font-bold p-1">
                                        NARRACIÓN DE LOS HECHOS
                                    </div>
                                    <div className="border-b border-black p-1 min-h-[40px] text-justify uppercase leading-tight whitespace-pre-wrap">
                                        {narrative}
                                    </div>

                                    {/* TYPE SPECIFIC FIELDS */}
                                    {logType === 'inasistencia' && (
                                        <>
                                            <div className="flex border-b border-black">
                                                <div className="w-1/2 border-r border-black">
                                                    <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold">ACCIONES DOCENTE</div>
                                                    <div className="p-1 h-12 uppercase">{teacherActions}</div>
                                                </div>
                                                <div className="w-1/2">
                                                    <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold">ACCIÓN FORMATIVA</div>
                                                    <div className="p-1 h-12 uppercase">{formativeAction}</div>
                                                </div>
                                            </div>
                                            <div className="flex border-b border-black">
                                                <div className="w-1/2 border-r border-black p-1 font-bold flex justify-between">
                                                    <span>¿SE GENERÓ CITATORIO?</span>
                                                    <span>{generatedCitation ? 'SI' : 'NO'}</span>
                                                </div>
                                                <div className="w-1/2 p-1 font-bold flex justify-between">
                                                    <span>MEDIDAS TÉCNICAS (NO ASISTE):</span>
                                                </div>
                                            </div>
                                            <div className="border-b border-black p-1 uppercase min-h-[20px]">{technicalMeasure}</div>
                                            <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">ACCIONES CON APOYO UDEEI</div>
                                            <div className="border-b border-black p-1 uppercase min-h-[30px]">{udeeiActions}</div>
                                        </>
                                    )}

                                    {logType === 'conducta' && (
                                        <>
                                            <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">MEDIDAS TÉCNICO PEDAGÓGICAS APLICADAS</div>
                                            <div className="border-b border-black p-1 uppercase min-h-[30px]">{pedagogicalMeasure}</div>
                                            
                                            <div className="flex border-b border-black text-[9px]">
                                                <div className="w-1/3 border-r border-black p-1">
                                                    <span className="font-bold">CONCILIACIÓN:</span> {conciliation ? 'SI' : 'NO'}
                                                </div>
                                                <div className="w-1/3 border-r border-black p-1">
                                                    <span className="font-bold">CANALIZACIÓN:</span> {canalization ? 'SI' : 'NO'} {canalizationInstitution && `(${canalizationInstitution})`}
                                                </div>
                                                <div className="w-1/3 p-1">
                                                    <span className="font-bold">PROTOCOLO ACOSO:</span> {bullyingProtocol ? 'SI' : 'NO'}
                                                </div>
                                            </div>
                                            {bullyingProtocol && <div className="border-b border-black p-1 uppercase"><span className="font-bold">MOTIVO PROTOCOLO:</span> {bullyingProtocolReason}</div>}
                                            
                                            <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">ACUERDOS CON ALUMNO(S)</div>
                                            <div className="border-b border-black p-1 uppercase min-h-[30px]">{agreementsStudent}</div>
                                        </>
                                    )}

                                    {logType === 'accidente' && (
                                        <>
                                                <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">MEDIDAS / ACCIONES APLICADAS</div>
                                                <div className="border-b border-black p-1 uppercase min-h-[30px]">{pedagogicalMeasure}</div>
                                                <div className="flex border-b border-black p-1 gap-2">
                                                    <span className="font-bold">SE ACTIVÓ VA SEGURO:</span> {vaSeguro ? 'SI' : 'NO'}
                                                    {vaSeguro && <span className="uppercase ml-2">OBSERVACIÓN: {vaSeguroObservation}</span>}
                                                </div>
                                        </>
                                    )}

                                    {/* ACUERDOS PADRES */}
                                    <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">ACUERDOS CON PADRE / MADRE / TUTOR</div>
                                    <div className="border-b border-black p-1 uppercase min-h-[40px] whitespace-pre-wrap">{agreementsParent}</div>

                                    {/* ATENCION BRINDADA */}
                                    <div className="bg-slate-200 print:bg-slate-200 p-1 font-bold border-b border-black">ATENCIÓN BRINDADA AL PADRE / MADRE / TUTOR</div>
                                    <div className="p-1 uppercase min-h-[30px] whitespace-pre-wrap">{attentionToParent}</div>
                                </div>

                                {/* SIGNATURES */}
                                <div className="mt-8 grid grid-cols-2 gap-12 text-center text-[10px] uppercase">
                                    <div>
                                        <div className="border-t border-black pt-1 mb-1 font-bold">{data.subdirector}</div>
                                        <p>SUBDIRECTOR(A) DE GESTIÓN</p>
                                    </div>
                                    <div>
                                        <div className="border-t border-black pt-1 mb-1 font-bold">{parentName}</div>
                                        <p>PADRE O TUTOR</p>
                                    </div>
                                    <div>
                                        <div className="border-t border-black pt-1 mb-1 font-bold">{allStaff.find(s=>s.id === conformityStaffId)?.name || '__________________________'}</div>
                                        <p>PERSONAL QUE ATENDIÓ</p>
                                    </div>
                                    <div>
                                        <div className="border-t border-black pt-1 mb-1 font-bold"></div>
                                        <p>ALUMNO(A)</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* --- MINUTA SECTION --- */}
        {activeTab === 'minuta' && canEdit && (
            <>
               {minutaMode === 'list' && (
                   <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Minutas de Acuerdos</h3>
                            <button onClick={() => { 
                                setMinStudentName(''); setMinStudentGroup(''); setMinutaDate(new Date().toISOString().split('T')[0]); 
                                setMinutaTime(''); setMinutaParentName(''); setMinutaSubject(''); setMinutaDescription(''); 
                                setMinutaActions(''); setMinutaAgreements(''); setMinutaAttendedBy(''); setMinutaMode('create'); 
                            }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"><Plus size={20} /> Nueva Minuta</button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Asunto</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Atendió</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(data.minutas || []).length > 0 ? data.minutas.map(min => (
                                        <tr key={min.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(min.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 uppercase">{min.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-800">{min.studentName}</div><div className="text-xs text-slate-400">{min.group}</div></td>
                                            <td className="px-6 py-4 text-sm text-slate-600 uppercase">{min.attendedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadMinuta(min)} className="text-blue-600 hover:text-blue-800 mx-2"><Eye size={18} /></button>
                                                <button onClick={() => handleDeleteMinuta(min.id)} className="text-red-400 hover:text-red-600 mx-2"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay minutas registradas.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                   </div>
               )}
               
               {/* MINUTA CREATE MODE */}
               {minutaMode === 'create' && (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                       {/* INPUT FORM */}
                       <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800">Redacción de Minuta</h3>
                                <button onClick={() => setMinutaMode('list')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <input type="text" placeholder="Asunto..." value={minutaSubject} onChange={e => setMinutaSubject(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-bold" />
                                <input type="text" placeholder="Nombre Alumno..." value={minStudentName} onChange={e => setMinStudentName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm uppercase" />
                                <input type="text" placeholder="Grado y Grupo..." value={minStudentGroup} onChange={e => setMinStudentGroup(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                <input type="text" placeholder="Nombre Padre/Tutor..." value={minutaParentName} onChange={e => setMinutaParentName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={minutaDate} onChange={e => setMinutaDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    <input type="time" value={minutaTime} onChange={e => setMinutaTime(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <textarea placeholder="Descripción de la situación..." rows={4} value={minutaDescription} onChange={e => setMinutaDescription(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                <textarea placeholder="Acciones Previas / Respuesta..." rows={3} value={minutaActions} onChange={e => setMinutaActions(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                <textarea placeholder="Acuerdos y Compromisos..." rows={3} value={minutaAgreements} onChange={e => setMinutaAgreements(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                
                                <input type="text" placeholder="Atendido por..." value={minutaAttendedBy} onChange={e => setMinutaAttendedBy(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />

                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleSaveMinuta} disabled={!minStudentName} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex justify-center items-center gap-2"><Save size={20} /> Guardar</button>
                                    <button onClick={handlePrint} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-lg flex justify-center items-center gap-2"><Printer size={20} /> Imprimir</button>
                                </div>
                            </div>
                       </div>
                       
                       {/* PREVIEW */}
                       <div className="lg:col-span-2 print:w-full print:col-span-3">
                            <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] p-[20mm] print:shadow-none print:w-full print:max-w-none relative text-black">
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-8 right-12 w-16 h-20 object-contain opacity-90" />
                                
                                <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                                    <h1 className="text-base font-bold uppercase">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                                    <h1 className="text-base font-bold uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                                    <p className="text-sm text-slate-600 mt-2">Ciclo Escolar {schoolCycle}</p>
                                    <h2 className="text-xl font-bold uppercase mt-4">MINUTA DE ACUERDOS</h2>
                                    <p className="text-sm font-bold mt-1 uppercase">ASUNTO: {minutaSubject || '____________________'}</p>
                                </div>

                                <div className="text-right text-sm mb-6">
                                    <p>Ciudad de México, a {minutaDate ? new Date(minutaDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}</p>
                                    <p>Hora de inicio: {minutaTime || '____'}</p>
                                </div>

                                <div className="mb-6 p-4 border border-black text-sm">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <p><strong>ALUMNO:</strong> <span className="uppercase">{minStudentName}</span></p>
                                        <p><strong>GRADO Y GRUPO:</strong> {minStudentGroup}</p>
                                    </div>
                                    <p><strong>PADRE / TUTOR:</strong> <span className="uppercase">{minutaParentName}</span></p>
                                </div>

                                <div className="space-y-6 text-justify text-sm">
                                    <div>
                                        <h4 className="font-bold border-b border-black mb-2 uppercase">1. Descripción de la Situación</h4>
                                        <p className="whitespace-pre-wrap">{minutaDescription || 'Sin descripción.'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold border-b border-black mb-2 uppercase">2. Antecedentes / Acciones Previas</h4>
                                        <p className="whitespace-pre-wrap">{minutaActions || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold border-b border-black mb-2 uppercase">3. Acuerdos y Compromisos</h4>
                                        <p className="whitespace-pre-wrap font-medium">{minutaAgreements || 'No se establecieron acuerdos.'}</p>
                                    </div>
                                </div>

                                <div className="mt-16 grid grid-cols-2 gap-16 text-center text-xs uppercase">
                                    <div>
                                        <div className="border-t border-black pt-2 font-bold">{minutaAttendedBy}</div>
                                        <p>POR LA ESCUELA</p>
                                    </div>
                                    <div>
                                        <div className="border-t border-black pt-2 font-bold">{minutaParentName}</div>
                                        <p>POR LA FAMILIA</p>
                                    </div>
                                    <div className="col-span-2 w-1/2 mx-auto mt-8">
                                        <div className="border-t border-black pt-2 font-bold">{data.subdirector}</div>
                                        <p>Vo. Bo. SUBDIRECCIÓN</p>
                                    </div>
                                </div>
                            </div>
                       </div>
                   </div>
               )}
            </>
        )}
      </div>
    </div>
  );
};

export default SubdireccionView;
