export default function ConsultationHistoryWidget() {
	const history = [
		{ id: 1, date: '17 Apr 2026', status: 'New', isNew: true },
		{ id: 2, date: '12 Apr 2025', status: 'Follow Up', isNew: false },
		{ id: 3, date: '12 Apr 2025', status: 'Follow Up', isNew: false },
		{ id: 4, date: '12 Apr 2025', status: 'Follow Up', isNew: false }
	];

	return (
		<div className='bg-[#D1D5DC] rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-sm h-fit'>
			<h3 className='text-center text-mdd font-medium text-gray-600  tracking-wide'>
				Consultation History
			</h3>
			<div className='flex flex-col gap-2'>
				{history.map(item => (
					<div
						key={item.id}
						className='bg-white p-3 md:p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-100'
					>
						<span className='text-sm font-medium text-gray-700'>
							{item.date}
						</span>
						<span
							className={`text-xs px-2 py-1 border rounded-lg font-medium ${
								item.isNew
									? 'border-red-400 text-red-500'
									: 'border-gray-300 text-gray-400'
							}`}
						>
							{item.status}
						</span>
					</div>
				))}
			</div>
			<button className='text-gray-500 font-medium text-xs hover:text-gray-700 transition-colors mt-2 underline'>
				More
			</button>
		</div>
	);
}
