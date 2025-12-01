# Backend API Testing Script

Write-Host "`n🧪 Testing Backend API...`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$testResults = @()

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✅ PASS: Health check successful" -ForegroundColor Green
    $testResults += "✅ Health Check: PASS"
} catch {
    Write-Host "❌ FAIL: Health check failed - $_" -ForegroundColor Red
    $testResults += "❌ Health Check: FAIL"
}

# Test 2: API Docs
Write-Host "`nTest 2: API Documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: API docs accessible" -ForegroundColor Green
        $testResults += "✅ API Docs: PASS"
    }
} catch {
    Write-Host "❌ FAIL: API docs not accessible - $_" -ForegroundColor Red
    $testResults += "❌ API Docs: FAIL"
}

# Test 3: Properties List (Public)
Write-Host "`nTest 3: Get Properties List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/properties" -Method Get -ErrorAction Stop
    Write-Host "✅ PASS: Properties list retrieved (Found $($response.data.properties.Count) properties)" -ForegroundColor Green
    $testResults += "✅ Properties List: PASS"
} catch {
    Write-Host "❌ FAIL: Properties list failed - $_" -ForegroundColor Red
    $testResults += "❌ Properties List: FAIL"
}

# Test 4: Mortgages List (Public)
Write-Host "`nTest 4: Get Mortgages List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/mortgages" -Method Get -ErrorAction Stop
    Write-Host "✅ PASS: Mortgages list retrieved" -ForegroundColor Green
    $testResults += "✅ Mortgages List: PASS"
} catch {
    Write-Host "❌ FAIL: Mortgages list failed - $_" -ForegroundColor Red
    $testResults += "❌ Mortgages List: FAIL"
}

# Test 5: Lawyers List (Public)
Write-Host "`nTest 5: Get Lawyers List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/lawyers" -Method Get -ErrorAction Stop
    Write-Host "✅ PASS: Lawyers list retrieved" -ForegroundColor Green
    $testResults += "✅ Lawyers List: PASS"
} catch {
    Write-Host "❌ FAIL: Lawyers list failed - $_" -ForegroundColor Red
    $testResults += "❌ Lawyers List: FAIL"
}

# Test 6: User Registration
Write-Host "`nTest 6: User Registration..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
$registerData = @{
    firstName = "Test"
    lastName = "User"
    email = $testEmail
    password = "Test1234"
    province = "ON"
    role = "Buyer"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -ContentType "application/json" -ErrorAction Stop
    if ($response.token) {
        Write-Host "✅ PASS: User registered successfully" -ForegroundColor Green
        Write-Host "   Token received: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        $testResults += "✅ User Registration: PASS"
        $global:testToken = $response.token
        $global:testUserId = $response.user._id
    }
} catch {
    Write-Host "❌ FAIL: Registration failed - $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Gray
    }
    $testResults += "❌ User Registration: FAIL"
}

# Test 7: User Login (if registration succeeded)
if ($global:testToken) {
    Write-Host "`nTest 7: User Login..." -ForegroundColor Yellow
    $loginData = @{
        email = $testEmail
        password = "Test1234"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
        if ($response.token) {
            Write-Host "✅ PASS: User logged in successfully" -ForegroundColor Green
            $testResults += "✅ User Login: PASS"
            $global:testToken = $response.token
        }
    } catch {
        Write-Host "❌ FAIL: Login failed - $_" -ForegroundColor Red
        $testResults += "❌ User Login: FAIL"
    }
}

# Test 8: Get Current User (if authenticated)
if ($global:testToken) {
    Write-Host "`nTest 8: Get Current User..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $global:testToken"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "✅ PASS: Current user retrieved" -ForegroundColor Green
        Write-Host "   User: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Gray
        $testResults += "✅ Get Current User: PASS"
    } catch {
        Write-Host "❌ FAIL: Get current user failed - $_" -ForegroundColor Red
        $testResults += "❌ Get Current User: FAIL"
    }
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        TEST RESULTS SUMMARY                ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════╣" -ForegroundColor Cyan
$testResults | ForEach-Object {
    Write-Host "║  $_" -ForegroundColor White
}
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_ -like "✅*" }).Count
$failed = ($testResults | Where-Object { $_ -like "❌*" }).Count

Write-Host "`n📊 Results: $passed passed, $failed failed out of $($testResults.Count) tests`n" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })

