import StudentIdentityWidget from '../../components/admin-guidance-widget/studentInfo.tsx';
import ConsultationHistoryWidget from '../../components/admin-guidance-widget/consultation.tsx';
import MedicalDataWidget from '../../components/admin-guidance-widget/medicalData.tsx';

export default function StudentProfilePage() {
	return (
		<div className='min-h-screen bg-white'>
			<div className='flex flex-col lg:flex-row w-full h-full'>
				<div className='w-full lg:w-95 p-4 md:p-6 lg:border-r lg:border-gray-200 flex flex-col gap-6 shrink-0'>
					<StudentIdentityWidget />

					<ConsultationHistoryWidget />

					<button className='w-full bg-white border border-gray-200 py-3 rounded-full font-bold text-gray-700 shadow-sm flex justify-center items-center gap-2 hover:bg-gray-50 transition-all active:scale-95'>
						<span className='text-lg'>📅</span> Schedule a Consultation
					</button>
				</div>

				<div className='grow p-4 md:p-6 lg:p-10 bg-white flex flex-col gap-8'>
					<MedicalDataWidget
						title='Active Conditions'
						rows={[
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							}
						]}
					/>

					<MedicalDataWidget
						title='Medications'
						rows={[
							{
								label: 'Depression',
								subLabel: 'Antidepressants',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							}
						]}
					/>

					<MedicalDataWidget
						title='Hospitalization/Treatment History'
						rows={[
							{
								label: 'Depression',
								subLabel: 'Mental Hospital',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							},
							{
								label: 'Depression',
								subLabel: 'N/A',
								date: 'December 22, 2023'
							}
						]}
					/>

					{/* SOS Notification Modal */}
					<div className='fixed bottom-24 left-4 right-4 md:left-auto md:bottom-10 md:right-10 lg:bottom-12 lg:right-12 z-50'>
						<div className='bg-red-100 border-2 border-white rounded-xl p-4 pr-10 shadow-2xl flex items-center gap-4 relative max-w-87.5'>
							<div className='overflow-hidden shrink-0'>
								<img
									src='/src/assets/gimi-head-right.svg'
									alt='GIMI'
									className='h-20 w-20'
								/>
							</div>
							<div className='flex-1'>
								<div className='text-md font-semibold text-gray-500 flex items-center gap-1 uppercase tracking-tighter'>
									GIMI <span className='text-red-500'>🚨</span>
								</div>
								<div className='text-red-600 font-black text-md leading-tight uppercase'>
									(STUDENT NAME){' '}
									<span className='text-gray-500 font-normal lowercase'>
										is in a <br />
										serious situation!{' '}
									</span>{' '}
									<span className='text-md'>SOS.</span>
								</div>
							</div>
							<button className='absolute top-4 right-4 text-red-300 font-bold hover:text-red-500'>
								✕
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
