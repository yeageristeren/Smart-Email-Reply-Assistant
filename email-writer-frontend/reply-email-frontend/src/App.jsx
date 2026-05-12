
import { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import { ContentCopy, AutoAwesome } from '@mui/icons-material'
import axiosInstance from './axios'

function App() {
  const [emailInput, setEmailInput] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedOutput, setGeneratedOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'grateful', label: 'Grateful' },
    { value: 'brief', label: 'Brief' },
  ]

  const handleGenerate = async () => {
    if (!emailInput.trim()) {
      alert('Please enter an email to reply to')
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post('/email/generate', {
        content: emailInput,
        tone: tone,
      })

      // Extract the generated reply from response
      const generatedReply = response.data.reply || response.data.message || response.data
      setGeneratedOutput(generatedReply)
    } catch (error) {
      console.error('Error generating response:', error)
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to generate reply'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          📧 Email Reply Generator
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          AI-powered email response generator with custom tone selection
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Input Section */}
        <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Original Email
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Paste the email you want to reply to here..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
              },
            }}
          />
        </Paper>

        {/* Tone Selection */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Response Tone
          </Typography>
          <Select
            fullWidth
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            variant="outlined"
          >
            {toneOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Paper>

        {/* Generate Button */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={loading || !emailInput.trim()}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {loading ? 'Generating...' : 'Generate Reply'}
          </Button>
        </Box>

        {/* Generated Output Section */}
        {generatedOutput && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Generated Response
            </Typography>
            <Card elevation={3}>
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={generatedOutput}
                  onChange={(e) => setGeneratedOutput(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                    },
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ContentCopy />}
                    onClick={handleCopyToClipboard}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                  </Button>
                </Box>
                {copied && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Response copied to clipboard!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Empty State */}
        {!generatedOutput && !loading && (
          <Card
            elevation={0}
            sx={{
              backgroundColor: '#e3f2fd',
              border: '2px dashed #2196f3',
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography color="textSecondary">
              Enter an email and click "Generate Reply" to see the AI-generated response
            </Typography>
          </Card>
        )}
      </Stack>
    </Container>
  )
}

export default App
