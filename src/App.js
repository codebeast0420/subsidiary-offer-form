import { FormControl, InputLabel, Select, MenuItem, CssBaseline, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import './App.css';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { industries, sectors, subdiaries } from './constants';

function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

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
    com7: '',
    com7desc: '',
  });

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
    com7,
    com7desc,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    if (!companyName || !email) {
      console.log('here')
      return toast.error('Please fill in all fields');
    }

    if (companyName && email && !email.includes('@')) {
      return toast.error('Invalid email');
    }

    try {
      console.log('data', data);
      const response = await fetch('https://v1.nocodeapi.com/johndkv/google_sheets/sHitMQQLfiqiwMiN?tabId=Form responses 1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([[
          new Date().toLocaleString(),
          companyName,
          email,
          subdiaries[subsidiary].name,
          subdiaries[subsidiary].url,
          subdiaries[subsidiary].email,
          subdiaries[subsidiary].logo,
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
          com7,
          com7desc,
        ]])
      });
      await response.json();
      toast.success('Company added successfully');
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
            <div className='form-group col-md-6'>
              <TextField fullWidth id="outlined-basic" label="Company" name='companyName' placeholder='Company' value={data.companyName} onChange={handleChange} variant="outlined" />
            </div>
            <div className='form-group col-md-6'>
              <TextField fullWidth type='email' id="outlined-basic" label="My Email" name='email' placeholder='My Email' value={data.email} onChange={handleChange} variant="outlined" />
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
            <div className='mt-2 col-md-6'>
              <div className='form-group mt-3'>
                <TextField fullWidth id="outlined-basic" label="Component 7" name='com7' placeholder='Component 7' value={data.com7} onChange={handleChange} variant="outlined" />
              </div>
              <div className='form-group mt-2'>
                <TextField
                  multiline
                  name='com7desc'
                  className='mt-1'
                  placeholder='Component 7 Description'
                  value={data.com7desc}
                  onChange={handleChange}
                  label="Component 7 Description"
                  variant="outlined"
                  fullWidth
                />
              </div>
            </div>
          </div>
          <div className='card-footer d-flex justify-content-between mt-3 w-100'>
            <button className='btn btn-primary mt-2 p-2' style={{ width: '40%' }}>Submit</button>
            <a href='https://docs.google.com/document/d/1qd16HyHbsOcTav0lc0gUP1xMcA19m_drv6LIKkXkz7c/edit?usp=sharing' target='_blank' className='btn btn-primary mt-2 p-2' style={{ width: '40%' }}>View Template</a>
          </div>
        </form>
      </div>
    </ThemeProvider>
  );
}

export default App;
