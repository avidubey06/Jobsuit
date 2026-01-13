import React, { useState } from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Wand2, Check } from 'lucide-react';
import { rewriteBulletPoint } from '../services/geminiService';

interface ResumePreviewProps {
  data: ResumeData;
  isCondensed: boolean;
  onUpdate: (newData: ResumeData) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, isCondensed, onUpdate }) => {
  const [rewritingId, setRewritingId] = useState<string | null>(null);

  const handleRewriteBullet = async (expId: string, index: number, bullet: string) => {
    const uniqueId = `${expId}-${index}`;
    setRewritingId(uniqueId);
    try {
      // Find role context
      const exp = data.experience.find(e => e.id === expId);
      const role = exp?.role || "Professional";
      
      const newBullet = await rewriteBulletPoint(bullet, role);
      
      const newData = { ...data };
      const expIndex = newData.experience.findIndex(e => e.id === expId);
      if (expIndex !== -1) {
        newData.experience[expIndex].description[index] = newBullet;
        onUpdate(newData);
      }
    } catch (e) {
      console.error("Failed to rewrite", e);
    } finally {
      setRewritingId(null);
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-sm ${isCondensed ? 'p-6 max-w-[210mm]' : 'p-10 max-w-4xl'} mx-auto min-h-[297mm] transition-all duration-300`}>
      
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className={`${isCondensed ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900 uppercase tracking-wide`}>
          {data.fullName}
        </h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          {data.contactInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {data.contactInfo.email}
            </div>
          )}
          {data.contactInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {data.contactInfo.phone}
            </div>
          )}
          {data.contactInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {data.contactInfo.location}
            </div>
          )}
          {data.contactInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              {data.contactInfo.linkedin}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300 mb-2 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300 mb-2 pb-1">
            Core Competencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">
          Professional Experience
        </h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                <span className="text-xs text-gray-500 font-medium">{exp.dates}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                <span className="text-xs text-gray-500 italic">{exp.location}</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1">
                {exp.description.map((bullet, idx) => {
                  const uniqueId = `${exp.id}-${idx}`;
                  const isUpdating = rewritingId === uniqueId;

                  return (
                    <li key={idx} className="text-sm text-gray-700 leading-snug group relative pl-1">
                      <span className={isUpdating ? 'opacity-50' : ''}>{bullet}</span>
                      
                      {/* Magic Rewrite Button (Visible on hover) */}
                      {!isCondensed && (
                        <button 
                          onClick={() => handleRewriteBullet(exp.id, idx, bullet)}
                          disabled={isUpdating}
                          className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Auto-improve this bullet"
                        >
                          {isUpdating ? (
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Wand2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">
          Education
        </h2>
        <div className="space-y-3">
          {data.education.map((edu) => (
            <div key={edu.id}>
               <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-sm">{edu.school}</h3>
                <span className="text-xs text-gray-500 font-medium">{edu.dates}</span>
              </div>
              <div className="text-sm text-gray-700">{edu.degree}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResumePreview;
