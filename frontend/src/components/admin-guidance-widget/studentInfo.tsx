export default function StudentIdentityWidget() {
	const keywords = ['Kms', 'Kill', 'Princess', 'Dead'];

	return (
		<div className='bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4'>
			<div className='flex justify-between items-start'>
				<h2 className='text-xl md:text-2xl font-bold text-gray-800'>
					Zoie Estorba
				</h2>
				<button className='text-gray-400 dec text-sm underline flex items-center gap-1 py-1 underline-offset-4'>
					Edit
				</button>
			</div>

			<p className='text-sm text-gray-600 leading-relaxed'>
				Student is experiencing a{' '}
				<span className='text-red-500 font-bold'>consistent sad mood</span>{' '}
				based on their mood calendar and{' '}
				<span className='text-red-500 font-bold'>
					alarming journal entries
				</span>{' '}
				with key words:
			</p>

			<div className='flex flex-wrap gap-2 p-3 md:p-4 bg-[#E5E7EB] rounded-xl border border-gray-100'>
				{keywords.map(word => (
					<span
						key={word}
						className='bg-[#FFE2E2] text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-[#FFC9C9]'
					>
						{word}
					</span>
				))}
			</div>

			<div className='flex flex-wrap gap-2 mb-2 align-center content-center'>
				{['56 yrs old', 'Female', 'She/Her'].map(tag => (
					<span
						key={tag}
						className='px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white'
					>
						{tag}
					</span>
				))}
			</div>

			<div className='space-y-3 pt-2'>
				<div className='flex justify-between text-sm'>
					<span className='text-gray-400'>DOB</span>
					<span className='text-gray-700 font-medium'>
						October 7, 2004
					</span>
				</div>
				<div className='flex justify-between text-sm'>
					<span className='text-gray-400'>Student Num</span>
					<span className='text-gray-700 font-medium'>C202301020207</span>
				</div>
				<div className='flex justify-between text-sm'>
					<span className='text-gray-400'>Program</span>
					<span className='text-gray-700 font-medium'>CSC-31</span>
				</div>
				<div className='flex justify-between text-sm'>
					<span className='text-gray-400'>Risk Level</span>
					<span className='text-red-600 font-black font-bold'>HIGH</span>
				</div>
			</div>
		</div>
	);
}
