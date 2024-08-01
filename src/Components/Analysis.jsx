import { useEffect, useState } from 'react';
import {
	Button,
	Container,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	createTheme,
	CssBaseline,
	ThemeProvider,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	Box,
	CircularProgress,
	Link,
	Modal,
	Stack
} from '@mui/material';
import OpenAI from 'openai';

const Analysis = ({ setSummary, setIsAnalysis }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		company: '',
		websiteUrl: ''
	});

	const [error, setError] = useState({
		websiteUrl: false,
		name: false,
		email: false,
		company: false
	});
	const [threadId, setThreadId] = useState(null);
	const [result, setResult] = useState([]);
	const [imageUrl, setImageUrl] = useState("");
	const [loading, setLoading] = useState({
		status: false,
		message: 'Getting Image...'
	});
	const [modalOpen, setModalOpen] = useState(false);

	const openai = new OpenAI({ apiKey: process.env.REACT_APP_ANALYSIS_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

	useEffect(() => {
		createThread();
	}, [formData.websiteUrl])
	const createThread = async () => {
		const thread = await openai.beta.threads.create();
		setThreadId(thread.id);
	}

	const darkTheme = createTheme({
		palette: {
			mode: 'dark',
		},
	});
	const handleModalOpen = () => setModalOpen(true); // Function to open modal
	const handleModalClose = () => setModalOpen(false);


	const createMessage = async (url) => {
		// if (prompt === "") return;
		setLoading({ status: true, message: 'Analyzing...' });
		const message = await openai.beta.threads.messages.create(
			threadId,
			{
				role: "user",
				content: [
					{
						"type": "text",
						"text": "Give me a tabulated score-based assessment of the visual components of this image. Use the items and criteria in your file 'methodology_for_assessing_visual_components.pdf'. Table fields are as follows: 1. Visual Component, 2. Score, 3. Comments."
					},
					{
						"type": "image_url",
						"image_url": { "url": url }
					},
				]
			}
		);
		let run = await openai.beta.threads.runs.createAndPoll(
			threadId,
			{
				assistant_id: process.env.REACT_APP_ANALYSIS_ASSISTANT_ID,
				// instructions: "Deep Knowledge Group, do you know about this?"
			}
		);
		if (run.status === 'completed') {
			const messages = await openai.beta.threads.messages.list(
				run.thread_id
			);

			for (const message of messages.data.reverse()) {
				if (message.role !== "assistant") continue;
				let index = 0;
				const { text } = message.content[0];
				text.value = text.value.replace(/\*\*/g, "");
				text.value = text.value.replace(/\#\#\#/g, "");
				const { annotations } = text;
				const citations = [];
				for (let annotation of annotations) {
					// text.value = text.value.replace(annotation.text, "[" + index + "]");
					text.value = text.value.replace(annotation.text, "");
					const { file_citation } = annotation;
					if (file_citation) {
						const citedFile = await openai.files.retrieve(file_citation.file_id);
						citations.push("[" + index + "]" + citedFile.filename);
					}
					index++;
				}

				// history.push({ role: message.role, content: text.value });
				const lines = text.value.split("\n");
				const extractedArrays = lines.map(line => {
					return line.split('|')
						.map(item => item.trim())
						.filter(item => !item.includes("-----") && item !== "");
				});
				setResult(extractedArrays.filter(item => item.length > 2));
			}
			setLoading({ status: false, message: 'Getting Image...' });
		} else {
			setLoading({ status: false, message: 'Getting Image...' });
		}
	}

	const getScreenshot = async () => {
		if (formData.websiteUrl === "") {
			setError({ ...error, websiteUrl: true, message: 'Please enter a valid URL.' });
			return;
		}
		if (error.websiteUrl) return;
		setImageUrl("");
		setError({ ...error, websiteUrl: false });
		setResult([]);
		setLoading({ status: true, message: 'Getting Image...' });
		await fetch('https://platform.dkv.global/dashboards/api/screenshot/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			// body: JSON.stringify({ulr})
			body: JSON.stringify({ url: formData.websiteUrl })
		})
			.then(response => response.json())
			.then(async data => {
				if (!data.renderUrl) {
					setLoading({ status: false, message: 'Getting Image...' });
					alert('Failed to get image. Please try again.');
					return;
				}
				setImageUrl(data.renderUrl);
				await createMessage(data.renderUrl);
				handleModalOpen();
			});
	}

	const isValidName = (name) => {
		return /^[a-zA-Z\s]+$/.test(name);
	};

	const isValidEmail = (email) => {
		return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
	};

	const isValidCompany = (company) => {
		return company.length > 0;  // Basic validation; adjust as needed
	};
	const isValidUrl = (input) => {
		const pattern = new RegExp('^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$', 'i');

		return pattern.test(input);
	};

	// Handle URL Change
	// const handleUrlChange = (e) => {
	//   const inputUrl = e.target.value;
	//   setUrl(inputUrl);
	//   if (!isValidUrl(inputUrl) && inputUrl.length > 0) {
	//     setError({ url: true, message: 'Please enter a valid URL.' });
	//   } else {
	//     setError({ url: false, message: '' });
	//   }
	// };


	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));

		let isValid = true;
		switch (name) {
			case 'name':
				isValid = isValidName(value);
				break;
			case 'email':
				isValid = isValidEmail(value);
				break;
			case 'company':
				isValid = isValidCompany(value);
				break;
			case 'websiteUrl':
				isValid = isValidUrl(value);
				break;
			default:
				break;
		}

		setError(prev => ({ ...prev, [name]: !isValid }));
	};

	let scores = result.slice(1).map(row => row[1] !== "N/A" ? parseInt(row[1]) : 0);
	let maxscore = Math.max(...scores);
	let totalScore = (scores.reduce((acc, score) => acc + score, 0) / (maxscore * scores.length) * 100).toFixed(1);
	let highScoreComponents = result.slice(1).filter(component => parseInt(component[1], 10) > maxscore - 1).map(row => row[0]);
	let lowScoreComponents = result.slice(1).filter(component => parseInt(component[1], 10) < 3).map(row => row[0]);

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container className="App d-flex flex-column align-items-center" style={{ padding: '2rem' }} >
				<Typography variant="h4" component="h2" textAlign={"center"} >
					Front-End Assessment Tool
				</Typography>
				<Grid container className='d-flex w-100 flex-column align-items-center' alignItems={"center"} spacing={2} marginTop={"10px"}>
					<TextField
						sx={{ marginTop: '10px' }}
						type='text'
						error={error.name}
						name="name"
						label="Name"
						fullWidth
						variant="outlined"
						required
						value={formData.name}
						onChange={handleInputChange}
						placeholder='Enter your name'
						helperText={error.name ? 'Invalid name' : ''}
					/>
					<TextField
						type='email' // Use 'email' to get appropriate keyboard on mobile devices
						error={error.email}
						sx={{ marginTop: '10px' }}
						name="email"
						label="Email"
						fullWidth
						variant="outlined"
						required
						value={formData.email}
						onChange={handleInputChange}
						placeholder='Enter your email'
						helperText={error.email ? 'Invalid email address' : ''}
					/>
					<TextField
						type='text'
						sx={{ marginTop: '10px' }}
						error={error.company}
						name="company"
						label="Company/Organization"
						fullWidth
						variant="outlined"
						required
						value={formData.company}
						onChange={handleInputChange}
						placeholder='Enter your company or organization'
						helperText={error.company ? 'Invalid company/organization name' : ''}
					/>
					<TextField
						type='url'
						sx={{ marginTop: '10px' }}
						error={error.websiteUrl}
						name="websiteUrl"
						label="Website Url"
						fullWidth
						variant="outlined"
						required
						value={formData.websiteUrl}
						onChange={handleInputChange}
						placeholder='Input Website Url'
						helperText={error.websiteUrl ? 'Please enter a valid URL.' : ''}
					/>
					<Grid item xs={10}>
						<Button variant='contained' onClick={getScreenshot} style={{ marginTop: "20px" }} size='large'>
							Get Analysis
						</Button>
					</Grid>
				</Grid>
				{imageUrl !== "" && (
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
						<Link href={imageUrl} target="_blank" rel="noopener noreferrer">
							Visit Image
						</Link>
					</Box>
				)}
				{loading.status && (
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
						<CircularProgress size={70} />
						<Typography variant="h6" component="h2" textAlign={"center"} marginTop={2}>
							{loading.message}
						</Typography>
					</Box>
				)}
				{!loading.status && result.length > 0 && (
					<Modal
						open={modalOpen}
						onClose={handleModalClose}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box
							sx={{
								position: 'absolute', // This is necessary for centering
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: { sm: '90%', md: '60%' }, // Responsive width
								maxHeight: '100vh', // Limits the height, preventing overflow
								overflowY: 'auto', // Allows scrolling within the modal
								bgcolor: 'background.paper', // Background color
								boxShadow: 24, // Shadow effect
								p: 2 // Padding around the content
							}}
						>
							<Container>
								<Typography variant="h4" component="h2" textAlign={"center"} marginTop={"20px"} >Analysis Result</Typography>
								<TableContainer component={Paper} sx={{ marginTop: 2 }} >
									<Table sx={{ minWidth: 650 }} aria-label="result table">
										<TableHead>
											<TableRow>
												{result[0].map((item, index) => {
													return <TableCell key={index}>{item}</TableCell>
												})}
											</TableRow>
										</TableHead>
										<TableBody>
											{result.slice(1).map((row, index) => {
												return <TableRow key={index}>
													{row.map((item, index) => {
														if (index === 1) {
															// Check if the score is "N/A"
															const scoreText = item === "N/A" ? `0/${maxscore}` : `${item}/${maxscore}`;
															return <TableCell key={index}>{scoreText}</TableCell>;
														} else {
															return <TableCell key={index}>{item}</TableCell>;
														}
													})}
												</TableRow>
											})}
										</TableBody>
									</Table>
								</TableContainer>
								<span>
									<Typography variant="h5" component="h2" textAlign={"left"} marginTop={"20px"} >Summary:
									</Typography>
								</span>
								<span>The website's visual components scored {totalScore}%, {totalScore < 80 ? `reflecting both strengths and areas for improvement.` : 'there is  some areas for improvement.'}</span>
								<sapn> Essential elements like {highScoreComponents.map((com, idx) => <sapn>{com}{idx < highScoreComponents.length - 1 && ', '}</sapn>)}are well-implemented.</sapn>
								<spn> However, the site lacks advanced visualizations such as {lowScoreComponents.map((com, idx) => <sapn>{com}{idx < lowScoreComponents.length - 1 && ', '}</sapn>)}. </spn>
								<sapn>Improving these elements can significantly improve the website's overall effectiveness and user experience.</sapn>
							</Container>
							<Stack direction="row" style={{ marginTop: '10px' }} spacing={2} justifyContent={"center"} >
								<Button variant='contained' onClick={() => {
									const summaryString = `The website's visual components scored ${totalScore}%, ${totalScore < 80 ? `reflecting both strengths and areas for improvement.` : 'there are some areas for improvement.'} Essential elements like ${highScoreComponents.join(', ')} are well-implemented.`
										+ `However, the site lacks advanced visualizations such as ${lowScoreComponents.join(', ')}. Improving these elements can significantly improve the website's overall effectiveness and user experience.`;
									console.log("summary", summaryString);
									setSummary(summaryString);
									setModalOpen(false);
									setIsAnalysis(false);
								}}>Import Diagnosis</Button>
								<Button variant='contained' onClick={() => {
									setModalOpen(false);
									setIsAnalysis(false);
								}}>Close</Button>
							</Stack>
						</Box>
					</Modal>
				)}
			</Container>
		</ThemeProvider>
	);
}

export default Analysis;
