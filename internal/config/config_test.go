package config

import (
	"os"
	"testing"
)

func TestHealthDisabledByDefault(t *testing.T) {
	os.Unsetenv("ROUTEBOARD_HEALTH_ENABLED")
	cfg := Load()
	if cfg.HealthEnabled {
		t.Errorf("HealthEnabled default = true, want false (health checks must be opt-in via ROUTEBOARD_HEALTH_ENABLED)")
	}
}

func TestHealthEnabledViaEnv(t *testing.T) {
	t.Setenv("ROUTEBOARD_HEALTH_ENABLED", "true")
	cfg := Load()
	if !cfg.HealthEnabled {
		t.Errorf("HealthEnabled = false with ROUTEBOARD_HEALTH_ENABLED=true, want true")
	}
}
