import { FormControl, InputLabel, Select, MenuItem, CssBaseline, TextField, Box, Modal, Typography, Button, CircularProgress, Stack, Autocomplete } from '@mui/material';
import { saveAs } from 'file-saver';
import OpenAI from 'openai';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import './App.css';
import { useEffect, useState, Fragment } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { industries, sectors, subdiaries } from './constants';
import Analysis from './Components/Analysis';

function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [proposal, setProposal] = useState('');
  const [summary, setSummary] = useState('');
  const [isAnalaysis, setIsAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [lead, setLead] = useState(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [data, setData] = useState({
    companyName: '',
    email: '',
    subsidiary: 0,
    industry: industries[0],
    sector: sectors[industries[0]][0],
    com1: '',
    com1desc: '',
    com2: '',
    com2desc: '',
    com3: '',
    com3desc: '',
    com4: '',
    com4desc: '',
    com5: '',
    com5desc: '',
    com6: '',
    com6desc: '',
    otherInfo: ''
  });

  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

  const createThread = async () => {
    const thread = await openai.beta.threads.create();
    setThreadId(thread.id);
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    maxHeight: '80vh',
    overflowY: 'auto',
    p: 4,
  };

  const analysisStyle = {
    position: 'absolute', // This is necessary for centering
    top: '50%',
    left: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
    width: { sm: '90%', md: '60%' }, // Responsive width
    maxHeight: '100vh', // Limits the height, preventing overflow
    overflowY: 'auto', // Allows scrolling within the modal
    bgcolor: 'background.paper', // Background color
    boxShadow: 24, // Shadow effect
    p: 2 // Padding around the content
  }

  useEffect(() => {
    createThread();
    fetchSheet();
  }, []);

  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      sector: sectors[data.industry][0],
    }));
  }, [data.industry]);

  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      otherInfo: summary !== "" ? "This proposal seeks to solve the following diagnosis:\n" + summary : ""
    }));
  }, [summary]);

  useEffect(() => {
    if (lead) {
      setData({
        companyName: lead["Company Name"],
        email: lead["Email"],
        subsidiary: 0,
        industry: industries[0],
        sector: sectors[industries[0]][0],
        com1: '',
        com1desc: '',
        com2: '',
        com2desc: '',
        com3: '',
        com3desc: '',
        com4: '',
        com4desc: '',
        com5: '',
        com5desc: '',
        com6: '',
        com6desc: '',
        otherInfo: (lead["Domain"] ? `Domain is ${lead["Domain"]}\n` : "") + (lead["Country"] ? `Country is ${lead["Country"]}\n` : "") + (lead["HubSpot Score"] ? `HubSpot Score is ${lead["HubSpot Score"]}\n` : "")
      });
    }
  }, [lead]);

  const saveProposalAsTxt = () => {
    const proposalContent = proposal;
    const blob = new Blob([proposalContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${companyName} and ${subdiaries[subsidiary].name} Cooperation Proposal.txt`);
  };

  const fetchSheet = async () => {
    try {
      const response = await fetch('https://codeby-backend.vercel.app/get-sheet/');
      // const response = await fetch('http://localhost:5000/get-sheet/');

      // Convert the response body to JSON
      const data = await response.json();

      // Assuming the server returns an array, you can set the leads state
      console.log("data", data);
      setLeads(data); // data should be an array, based on your server response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const submitProposal = async () => {
    try {
      const response = await fetch('https://codeby-backend.vercel.app/proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordID: lead["Record ID"],
          proposal: proposal,
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('response', response.ok);
      const responseData = await response.json();
      console.log('Proposal submitted successfully:', responseData);
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  }

  const {
    companyName,
    email,
    subsidiary,
    industry,
    sector,
    com1,
    com1desc,
    com2,
    com2desc,
    com3,
    com3desc,
    com4,
    com4desc,
    com5,
    com5desc,
    com6,
    com6desc,
    otherInfo,
  } = data;

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const handleChangeSub = (event) => {
    const selectedSubsidiaryIndex = event.target.value;
    setData(prevData => ({
      ...prevData,
      subsidiary: selectedSubsidiaryIndex,
    }));
  };

  const createMessage = async () => {
    setLoading(true);
    const prompt = `Examine the "proposal example" files in your knowledge, and based on that style and format, write for me an imaginary but realistic DKG's subsidiary ${subdiaries[subsidiary].name} cooperation proposal with ${companyName}.\n` +
      `Also, please reflect these information from User:\n` +
      `${com1}: ${com1desc}\n` +
      `${com2}: ${com2desc}\n` +
      `${com3}: ${com3desc}\n` +
      `${com4}: ${com4desc}\n` +
      `${com5}: ${com5desc}\n` +
      `${com6}: ${com6desc}\n` +
      `Other Information: ${otherInfo}\n` +
      `Please create proposal without any annotations.`;
    const message = await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: prompt,
      }
    );

    let run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      {
        assistant_id: process.env.REACT_APP_ASSISTANT_ID,
      }
    );
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );

      const history = [];
      for (const message of messages.data.reverse()) {
        console.log(`${message.role} > ${message.content[0].text.value}`);
        let index = 0;
        const { text } = message.content[0];
        text.value = text.value.replace(/\*\*/g, "");
        text.value = text.value.replace(/\#\#\#/g, "");
        text.value = text.value.replace(/\#/g, "");
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
        history.push({ role: message.role, content: text.value });
        console.log(citations.join("\n"));
      }
      console.log(history);
      setProposal(history[history.length - 1].content);
      let message = `TO: ${email}\n` +
        `Subject: ${companyName} and ${subdiaries[subsidiary].name} Cooperation Proposal\n` +
        'Content-Type: text/html; charset=utf-8\n\n' +
        '<html>' +
        '<body>' +
        `<h1>${companyName} and ${subdiaries[subsidiary].name} Cooperation Proposal</h1>` +
        '<br>' +
        history[history.length - 1].content.split('\n').map(line => `<p>${line}</p>`).join('') +
        '</body>' +
        '</html>';

      await fetch('https://gmail-beta.vercel.app/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        })
      });
      // }
    } else {
      console.log(run.status);
    }
  }

  const clearData = () => {
    setData({
      companyName: '',
      email: '',
      subsidiary: 0,
      industry: industries[0],
      sector: sectors[industries[0]][0],
      com1: '',
      com1desc: '',
      com2: '',
      com2desc: '',
      com3: '',
      com3desc: '',
      com4: '',
      com4desc: '',
      com5: '',
      com5desc: '',
      com6: '',
      com6desc: '',
      com7: '',
      com7desc: '',
    });
    setSummary("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    if (!companyName) {
      console.log('here')
      return toast.error('Please fill in Recipient Organization');
    }

    if (!companyName || !email) {
      console.log('here')
      return toast.error('Please fill in Email');
    }

    if (companyName && email && !email.includes('@')) {
      return toast.error('Invalid email');
    }

    try {
      console.log('data', data);
      await createMessage();
      setLoading(false);
      setOpen(true);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className='w-100 d-flex align-items-center justify-content-center bg-dark p-5' onSubmit={handleSubmit}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <form className='card shadow-lg p-5 form bg-dark d-flex align-items-center' style={{ width: '60%', maxWidth: '800px' }}>
          <div className='card-header text-white text-center'>
            <h1>Create New Cooperation Proposal</h1>
          </div>
          <div className='card-body mt-3 d-flex row'>
            <Autocomplete
              fullWidth
              value={lead}
              loading={leadLoading}
              onChange={(event, newValue) => {
                setLead(newValue);
              }}
              id='select-leads'
              options={leads}
              getOptionLabel={(option) => option["Recent Conversion"]}
              filterSelectedOptions
              onInputChange={console.log('here')}
              renderOption={(props, option) => (
                <li {...props} key={option["Record ID"] || option["Recent Conversion"]}>
                  {option["Recent Conversion"]}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Entity"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {leadLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <div className='form-group mt-3 col-md-6'>
              <TextField fullWidth id="outlined-basic" label="Recipient Organization" name='companyName' placeholder='Recipient Organization' value={data.companyName} onChange={handleChange} variant="outlined" />
            </div>
            <div className='form-group mt-3 col-md-6'>
              <TextField fullWidth type='email' id="outlined-basic" label="Email" name='email' placeholder='Email' value={data.email} onChange={handleChange} variant="outlined" />
            </div>
            <div className='form-group mt-3 col-md-6'>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Subsidiary</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={data.subsidiary}
                  label="Subsidiary"
                  name='subsidiary'
                  onChange={handleChangeSub}
                >
                  {subdiaries.map((subsidiary, index) => (
                    <MenuItem key={index} value={index}>{subsidiary.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className='form-group mt-3 col-md-6'>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Industry</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={data.industry}
                  label="Industry"
                  name='industry'
                  onChange={handleChange}
                >
                  {industries.map((industry, index) => (
                    <MenuItem key={index} value={industry}>{industry}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className='form-group mt-3 col-md-6'>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Subsectors</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={data.sector}
                  label="Subsectors"
                  name='sector'
                  onChange={handleChange}
                >
                  {sectors[industry].map((s, index) => (
                    <MenuItem key={index} value={s}>{s}</MenuItem>
                  ))}
                  <MenuItem key='none' value={'None'}>None</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className='col-md-6'></div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 1" name='com1' placeholder='Component 1' value={data.com1} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com1desc'
                  className='mt-1'
                  placeholder='Component 1 Description'
                  value={data.com1desc}
                  onChange={handleChange}
                  label="Component 1 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 2" name='com2' placeholder='Component 2' value={data.com2} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com2desc'
                  className='mt-1'
                  placeholder='Component 2 Description'
                  value={data.com2desc}
                  onChange={handleChange}
                  label="Component 2 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 3" name='com3' placeholder='Component 3' value={data.com3} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com3desc'
                  className='mt-1'
                  placeholder='Component 3 Description'
                  value={data.com3desc}
                  onChange={handleChange}
                  label="Component 3 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 4" name='com4' placeholder='Component 4' value={data.com4} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com4desc'
                  className='mt-1'
                  placeholder='Component 4 Description'
                  value={data.com4desc}
                  onChange={handleChange}
                  label="Component 4 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 5" name='com5' placeholder='Component 5' value={data.com5} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com5desc'
                  className='mt-1'
                  placeholder='Component 5 Description'
                  value={data.com5desc}
                  onChange={handleChange}
                  label="Component 5 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 6" name='com6' placeholder='Component 6' value={data.com6} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com6desc'
                  className='mt-1'
                  placeholder='Component 6 Description'
                  value={data.com6desc}
                  onChange={handleChange}
                  label="Component 6 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-2 col-md-12'>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='otherInfo'
                  className='mt-1'
                  placeholder="Other Information: e.g. the recipient organization's website"
                  value={data.otherInfo}
                  rows={5}
                  onChange={handleChange}
                  label="Other Information: e.g. the recipient organization's website"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
          </div>
          <div className='card-footer d-flex justify-content-around mt-3 w-100'>
            <button type='button' className='btn btn-primary mt-2 p-2 d-flex align-items-center justify-content-center' style={{ width: '40%', height: "40px" }} disabled={loading} onClick={() => setIsAnalysis(true)}>
              Diagnose Frontend
            </button>
            <button type='submit' className='btn btn-primary mt-2 p-2 d-flex align-items-center justify-content-center' style={{ width: '40%', height: "40px" }} disabled={loading}>
              {loading ? <><CircularProgress size={20} /> <span style={{ marginLeft: "8px" }}>Submitting</span></> : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {companyName} and {subdiaries[subsidiary].name} Cooperation Proposal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {proposal.split('\n').map((line, index) => (
              <Fragment key={index}>
                {line}
                <br />
              </Fragment>
            ))}
          </Typography>
          <Stack direction="row" style={{ marginTop: '10px' }} spacing={2} justifyContent={"center"} >
            <Button variant='contained' onClick={() => {
              saveProposalAsTxt();
              clearData();
              setOpen(false);
            }}>Save</Button>
            <Button variant='contained' onClick={() => {
              submitProposal();
              clearData();
              setOpen(false);
            }}>Save to Sheet</Button>
            <Button variant='contained' onClick={() => {
              navigator.clipboard.writeText(proposal);
              alert('Proposal copied to clipboard');
            }}>Copy</Button>
            <Button variant='contained' onClick={() => {
              setOpen(false);
              clearData();
            }}>Close</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={isAnalaysis}
        onClose={() => setIsAnalysis(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={analysisStyle}>
          <Analysis setSummary={setSummary} setIsAnalysis={setIsAnalysis} />
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

export default App;
