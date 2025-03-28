const { Client } = require('@notionhq/client');

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Update this in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Check method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }
  
  try {
    // Parse the form data
    const formData = JSON.parse(event.body);
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.userType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        })
      };
    }
    
    // Initialize Notion client
    const notion = new Client({ 
      auth: process.env.NOTION_API_KEY 
    });
    
    // Format interests for multi-select
    const interests = formData.interests ? 
      formData.interests.split(', ').map(interest => ({ name: interest })) : 
      [];
    
    // Create page in Notion database
    const response = await notion.pages.create({
      parent: { 
        database_id: process.env.NOTION_DATABASE_ID 
      },
      properties: {
        Name: {
          title: [{ text: { content: formData.name } }]
        },
        Email: {
          email: formData.email
        },
        "User Type": {
          select: {
            name: formData.userType
          }
        },
        Interests: {
          multi_select: interests
        },
        Referral: {
          select: {
            name: formData.referral || 'Not specified'
          }
        },
        "Submission Date": {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });
    
    // Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        id: response.id 
      })
    };
  } catch (error) {
    console.error('Notion API Error:', error);
    
    // Return error
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Server error processing your request' 
      })
    };
  }
};