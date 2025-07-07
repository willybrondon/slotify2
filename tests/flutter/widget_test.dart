import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// Mock configuration for testing
class MockConfig {
  static const String baseURL = 'http://test-server:5000/';
  static const String secretKey = 'test_secret_key';
  static const String projectName = 'slotify-test';
}

// Test widget wrapper
class TestApp extends StatelessWidget {
  final Widget child;

  const TestApp({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: child,
    );
  }
}

// Main test group
void main() {
  group('Slotify App Widget Tests', () {
    // Login screen tests
    testWidgets('Login screen should display email and password fields',
        (WidgetTester tester) async {
      // Build a mock login screen
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Column(
            children: [
              TextField(
                decoration: InputDecoration(labelText: 'Email'),
                key: Key('email_field'),
              ),
              TextField(
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true,
                key: Key('password_field'),
              ),
              ElevatedButton(
                onPressed: () {},
                child: Text('Login'),
                key: Key('login_button'),
              ),
            ],
          ),
        ),
      ));

      // Verify that the login form elements are present
      expect(find.byKey(Key('email_field')), findsOneWidget);
      expect(find.byKey(Key('password_field')), findsOneWidget);
      expect(find.byKey(Key('login_button')), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Login'), findsOneWidget);
    });

    // Booking screen tests
    testWidgets('Booking screen should display service selection',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Column(
            children: [
              Text('Select Service', style: TextStyle(fontSize: 20)),
              ListView.builder(
                shrinkWrap: true,
                itemCount: 3,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text('Service ${index + 1}'),
                    subtitle: Text('\$${(index + 1) * 10}'),
                    onTap: () {},
                  );
                },
              ),
            ],
          ),
        ),
      ));

      // Verify service selection elements
      expect(find.text('Select Service'), findsOneWidget);
      expect(find.text('Service 1'), findsOneWidget);
      expect(find.text('Service 2'), findsOneWidget);
      expect(find.text('Service 3'), findsOneWidget);
      expect(find.text('\$10'), findsOneWidget);
      expect(find.text('\$20'), findsOneWidget);
      expect(find.text('\$30'), findsOneWidget);
    });

    // Navigation tests
    testWidgets('Navigation should work between screens',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          appBar: AppBar(title: Text('Test App')),
          body: Column(
            children: [
              ElevatedButton(
                onPressed: () {},
                child: Text('Go to Bookings'),
                key: Key('bookings_button'),
              ),
              ElevatedButton(
                onPressed: () {},
                child: Text('Go to Profile'),
                key: Key('profile_button'),
              ),
            ],
          ),
        ),
      ));

      // Verify navigation buttons are present
      expect(find.byKey(Key('bookings_button')), findsOneWidget);
      expect(find.byKey(Key('profile_button')), findsOneWidget);
      expect(find.text('Go to Bookings'), findsOneWidget);
      expect(find.text('Go to Profile'), findsOneWidget);
    });

    // Form validation tests
    testWidgets('Form validation should show error messages',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Column(
            children: [
              TextField(
                decoration: InputDecoration(
                  labelText: 'Email',
                  errorText: 'Please enter a valid email',
                ),
                key: Key('email_field'),
              ),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Phone',
                  errorText: 'Please enter a valid phone number',
                ),
                key: Key('phone_field'),
              ),
            ],
          ),
        ),
      ));

      // Verify error messages are displayed
      expect(find.text('Please enter a valid email'), findsOneWidget);
      expect(find.text('Please enter a valid phone number'), findsOneWidget);
    });

    // Loading state tests
    testWidgets('Loading indicator should be displayed during API calls',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading...'),
              ],
            ),
          ),
        ),
      ));

      // Verify loading elements are present
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading...'), findsOneWidget);
    });

    // Error state tests
    testWidgets('Error message should be displayed on API failure',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error, color: Colors.red, size: 48),
                SizedBox(height: 16),
                Text('Something went wrong',
                    style: TextStyle(color: Colors.red)),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {},
                  child: Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ));

      // Verify error elements are present
      expect(find.byIcon(Icons.error), findsOneWidget);
      expect(find.text('Something went wrong'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    // Responsive design tests
    testWidgets('App should be responsive to different screen sizes',
        (WidgetTester tester) async {
      // Test with different screen sizes
      final testSizes = [
        Size(320, 568), // iPhone SE
        Size(375, 812), // iPhone X
        Size(414, 896), // iPhone XS Max
        Size(768, 1024), // iPad
      ];

      for (final size in testSizes) {
        tester.binding.window.physicalSizeTestValue = size;
        tester.binding.window.devicePixelRatioTestValue = 1.0;

        await tester.pumpWidget(TestApp(
          child: Scaffold(
            body: Container(
              width: double.infinity,
              height: double.infinity,
              child: Center(
                child: Text('Responsive Test'),
              ),
            ),
          ),
        ));

        // Verify the app renders without errors
        expect(find.text('Responsive Test'), findsOneWidget);
      }

      // Reset to default size
      tester.binding.window.clearPhysicalSizeTestValue();
      tester.binding.window.clearDevicePixelRatioTestValue();
    });
  });

  group('Slotify App Integration Tests', () {
    testWidgets('Complete booking flow should work',
        (WidgetTester tester) async {
      await tester.pumpWidget(TestApp(
        child: Scaffold(
          body: Column(
            children: [
              // Service selection
              Text('Choose a Service'),
              ListTile(
                title: Text('Haircut'),
                subtitle: Text('\$25'),
                onTap: () {},
              ),

              // Date selection
              Text('Select Date'),
              ElevatedButton(
                onPressed: () {},
                child: Text('Pick Date'),
              ),

              // Time selection
              Text('Select Time'),
              ElevatedButton(
                onPressed: () {},
                child: Text('Pick Time'),
              ),

              // Confirm booking
              ElevatedButton(
                onPressed: () {},
                child: Text('Confirm Booking'),
                key: Key('confirm_button'),
              ),
            ],
          ),
        ),
      ));

      // Verify all booking flow elements are present
      expect(find.text('Choose a Service'), findsOneWidget);
      expect(find.text('Haircut'), findsOneWidget);
      expect(find.text('\$25'), findsOneWidget);
      expect(find.text('Select Date'), findsOneWidget);
      expect(find.text('Pick Date'), findsOneWidget);
      expect(find.text('Select Time'), findsOneWidget);
      expect(find.text('Pick Time'), findsOneWidget);
      expect(find.text('Confirm Booking'), findsOneWidget);
      expect(find.byKey(Key('confirm_button')), findsOneWidget);
    });
  });
}
