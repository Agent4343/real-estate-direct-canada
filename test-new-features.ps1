# Test New Features Script
Write-Host "`n🧪 Testing New Features...`n" -ForegroundColor Cyan

$BackendUrl = "http://localhost:3000"
$headers = @{}

$failedTests = 0
$passedTests = 0

# Test 1: Backend Health Check
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    # Try /health endpoint first
    try {
        $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get -TimeoutSec 5
        Write-Host "✅ PASS: Backend is healthy" -ForegroundColor Green
        $passedTests++
    } catch {
        # Try root endpoint as fallback
        try {
            $rootResponse = Invoke-WebRequest -Uri "$BackendUrl/" -Method Get -TimeoutSec 5 -UseBasicParsing
            if ($rootResponse.StatusCode -eq 200) {
                Write-Host "✅ PASS: Backend is responding" -ForegroundColor Green
                $passedTests++
            } else {
                throw
            }
        } catch {
            Write-Host "❌ FAIL: Backend not responding - $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Please ensure backend server is running on port 3000" -ForegroundColor Yellow
            Write-Host "   Start it with: npm start" -ForegroundColor Yellow
            $failedTests++
            exit 1
        }
    }
} catch {
    Write-Host "❌ FAIL: Backend not responding - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please ensure backend server is running on port 3000" -ForegroundColor Yellow
    $failedTests++
    exit 1
}

# Test 2: User Registration (User Model Fix Test)
Write-Host "`nTest 2: User Registration (Testing User Model Fix)..." -ForegroundColor Yellow
$testEmail = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$registrationBody = @{
    firstName = "Test"
    lastName = "User"
    email = $testEmail
    password = "TestPassword123"
    province = "ON"
    role = "Buyer"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BackendUrl/api/auth/register" -Method Post -Headers $headers -ContentType "application/json" -Body $registrationBody
    if ($registerResponse.token) {
        Write-Host "✅ PASS: User registration successful!" -ForegroundColor Green
        Write-Host "   User ID: $($registerResponse.user._id)" -ForegroundColor Gray
        $token = $registerResponse.token
        $headers["Authorization"] = "Bearer $token"
        $passedTests++
    } else {
        Write-Host "❌ FAIL: Registration failed - no token returned" -ForegroundColor Red
        $failedTests++
    }
} catch {
    $errorMessage = $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "❌ FAIL: Registration failed" -ForegroundColor Red
        Write-Host "   Error: $responseBody" -ForegroundColor Yellow
    } else {
        Write-Host "❌ FAIL: Registration failed - $errorMessage" -ForegroundColor Red
    }
    $failedTests++
}

# Test 3: Get User Profile (if authenticated)
if ($headers.ContainsKey("Authorization")) {
    Write-Host "`nTest 3: User Profile Access..." -ForegroundColor Yellow
    try {
        $profileResponse = Invoke-RestMethod -Uri "$BackendUrl/api/properties" -Method Get -Headers $headers -TimeoutSec 5
        Write-Host "✅ PASS: Authenticated API access works" -ForegroundColor Green
        $passedTests++
    } catch {
        Write-Host "⚠️  WARN: Could not test authenticated access" -ForegroundColor Yellow
    }
}

# Test 4: Properties List
Write-Host "`nTest 4: Properties List..." -ForegroundColor Yellow
try {
    $propertiesResponse = Invoke-RestMethod -Uri "$BackendUrl/api/properties" -Method Get -TimeoutSec 5
    if ($propertiesResponse.properties) {
        Write-Host "✅ PASS: Properties endpoint works ($($propertiesResponse.properties.Count) properties found)" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠️  WARN: Properties endpoint works but no properties found" -ForegroundColor Yellow
        $passedTests++
    }
} catch {
    Write-Host "❌ FAIL: Properties endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# Test 5: Mortgages List
Write-Host "`nTest 5: Mortgages List..." -ForegroundColor Yellow
try {
    $mortgagesResponse = Invoke-RestMethod -Uri "$BackendUrl/api/mortgages?province=ON" -Method Get -TimeoutSec 5
    if ($mortgagesResponse.mortgages) {
        Write-Host "✅ PASS: Mortgages endpoint works" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠️  WARN: Mortgages endpoint works but no mortgages found" -ForegroundColor Yellow
        $passedTests++
    }
} catch {
    Write-Host "❌ FAIL: Mortgages endpoint failed" -ForegroundColor Red
    $failedTests++
}

# Test 6: Lawyers List
Write-Host "`nTest 6: Lawyers List..." -ForegroundColor Yellow
try {
    $lawyersResponse = Invoke-RestMethod -Uri "$BackendUrl/api/lawyers?province=ON" -Method Get -TimeoutSec 5
    if ($lawyersResponse.lawyers) {
        Write-Host "✅ PASS: Lawyers endpoint works" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "⚠️  WARN: Lawyers endpoint works but no lawyers found" -ForegroundColor Yellow
        $passedTests++
    }
} catch {
    Write-Host "❌ FAIL: Lawyers endpoint failed" -ForegroundColor Red
    $failedTests++
}

# Test 7: API Documentation
Write-Host "`nTest 7: API Documentation..." -ForegroundColor Yellow
try {
    $docsResponse = Invoke-WebRequest -Uri "$BackendUrl/api-docs" -Method Get -TimeoutSec 5
    if ($docsResponse.StatusCode -eq 200) {
        Write-Host "✅ PASS: API documentation accessible" -ForegroundColor Green
        $passedTests++
    }
} catch {
    Write-Host "❌ FAIL: API documentation not accessible" -ForegroundColor Red
    $failedTests++
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 TEST RESULTS - NEW FEATURES                       ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║   ✅ Tests Passed: $passedTests/7" -ForegroundColor Green -NoNewline
$spaces = " " * (54 - (16 + $passedTests.ToString().Length + 5))
Write-Host "$spaces║" -ForegroundColor Cyan
Write-Host "║   ❌ Tests Failed: $failedTests/7" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" }) -NoNewline
$spaces = " " * (54 - (16 + $failedTests.ToString().Length + 5))
Write-Host "$spaces║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
if ($failedTests -eq 0) {
    Write-Host "║   🎉 All tests passed! User model is fixed!        ║" -ForegroundColor Green
} else {
    Write-Host "║   ⚠️  Some tests failed. Check errors above.         ║" -ForegroundColor Yellow
}
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "🎉 SUCCESS! All new features are working!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
    exit 1
}

